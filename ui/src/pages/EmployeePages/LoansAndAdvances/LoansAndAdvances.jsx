import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, SendHorizontal, CheckCircle, X, TrendingUp, BadgePercent, Calendar, Receipt, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { LnAsService, notification } from '@/services';
import useAuthStore from '@/store/authStore';

const LoansAndAdvances = () => {
  // Auth user (for EmpID)
  const { user } = useAuthStore();
  // State for toggling "Loans" or "Advances" section
  const [section, setSection] = useState('loan');

  // EMI Calculator State
  const [emiFields, setEmiFields] = useState({ amount: '', term: '' });
  const [emiResult, setEmiResult] = useState(null);

  // Form State
  const [form, setForm] = useState({ type: 'Personal Loan', amount: '', termMonths: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Records state (fetched from API by employee)
  const [records, setRecords] = useState([]);
  const types = {
    loan: ['Personal Loan', 'Home Loan', 'Vehicle Loan', 'Education Loan'],
    advance: ['Salary Advance', 'Emergency Advance']
  };

  // EMI Calculation (interest-free)
  function calculateEMI(p, n) {
    if (!p || !n) return null;
    // Interest-free EMI = principal divided by number of months
    return Math.round(p / n);
  }
  const handleEmiChange = e => {
    const { name, value } = e.target;
    setEmiFields(f => ({ ...f, [name]: value }));
    setEmiResult(null);
  }
  const handleEmiSubmit = e => {
    e.preventDefault();
    const emi = calculateEMI(Number(emiFields.amount), Number(emiFields.term));
    setEmiResult(emi);
  }

  // Loan/Advance application
  function validate() {
    const e = {};
    if (!form.amount || isNaN(form.amount) || form.amount < 1000) e.amount = "Enter a valid amount (at least 1,000)";
    if (!form.termMonths || form.termMonths < 1 || form.termMonths > 60) e.termMonths = "Enter 1-60 months";
    if (!form.reason || form.reason.trim().length < 10) e.reason = "Provide a detailed reason (10+ chars)";
    return e;
  }
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
  async function handleFormSubmit(e) {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) return setErrors(e_);

    const notify = notification();
    setSubmitting(true);

    try {
      // Ensure we have EmpID from authenticated user
      const empId = user?.empId ?? user?.EmpID;
      if (!empId) {
        notify.error('Unable to detect employee ID. Please re-login and try again.');
        return;
      }

      // Build payload as per backend expectations
      const payload = {
        LnAID: 0,
        EmpID: Number(empId),
        LoanAmount: Number(form.amount),
        Period: Number(form.termMonths),
        InterestRate: 0,
        MonthlyInstallment: Math.round(Number(form.amount) / Number(form.termMonths)),
        StartDate: new Date().toISOString(),
        IsApproved: null,
        Description: form.reason,
        IsApprovedBy: 0
      };

      const created = await LnAsService.create(payload);
      if (created) {
        // Optimistically add to local list for UX
        setRecords(current => [
          {
            id: created?.LnAID || created?.id || `LN${current.length + 1}`,
            category: section,
            type: form.type,
            amount: Number(form.amount),
            termMonths: Number(form.termMonths),
            appliedDate: new Date().toISOString().slice(0, 10),
            status: (created?.IsApproved ?? created?.isApproved) ? 'approved' : 'pending',
            progress: 2,
            remarks: created?.Description || created?.remarks || '',
            emi: Math.round(form.amount / form.termMonths),
            remaining: Number(form.amount)
          },
          ...current
        ]);
        setForm({ type: types[section][0], amount: '', termMonths: '', reason: '' });
        setSuccessMsg('Your application is submitted!');
      }
    } catch (err) {
      // Notifications handled in service; keep here for safety
      notify.error('Failed to submit application');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  }

  // Date Formatting
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' }) : "--";
  // Currency Formatting
  const formatCurr = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Fetch existing loans/advances for current employee
  useEffect(() => {
    const load = async () => {
      const empId = user?.empId ?? user?.EmpID;
      if (!empId) return;
      const data = await LnAsService.getByEmployee(empId);
      const list = Array.isArray(data) ? data : [];
      // Map API records to UI format
      const mapped = list.map(item => ({
        id: item.LnAID ?? item.id,
        category: 'loan', // API doesn’t return category; default to 'loan'
        type: 'Loan', // API doesn’t return type; show generic
        amount: Number(item.LoanAmount) || 0,
        termMonths: Number(item.Period) || 0,
        appliedDate: item.StartDate || new Date().toISOString(),
        status: item.IsApproved === true ? 'approved' : item.IsApproved === false ? 'rejected' : 'pending',
        progress: 0,
        remarks: item.Description || '',
        emi: Number(item.MonthlyInstallment) || 0,
        remaining: Number(item.LoanAmount) || 0
      }))
      setRecords(mapped);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.empId, user?.EmpID]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 md:px-8 transition-colors">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Loans & Advances</h1>
            <p className="text-gray-600 text-md">Apply, track, and manage your financial requests.</p>
          </div>
          {/* Toggle */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 shadow-sm">
            <button
              className={`px-4 py-2 font-semibold rounded-md transition ${section==='loan'?'bg-blue-600 text-white shadow':'text-gray-700 hover:bg-blue-100'}`}
              onClick={()=>{ setSection('loan'); setForm(f=>({ ...f, type: types.loan[0] })); setErrors({}); setSuccessMsg('');}}
              type="button"
            >Loans</button>
            <button
              className={`px-4 py-2 font-semibold rounded-md transition ${section==='advance'?'bg-blue-600 text-white shadow':'text-gray-700 hover:bg-blue-100'}`}
              onClick={()=>{ setSection('advance'); setForm(f=>({ ...f, type: types.advance[0] })); setErrors({}); setSuccessMsg('');}}
              type="button"
            >Advances</button>
          </div>
        </div>

        {/* EMI Calculator */}
        <motion.section initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="mb-8">
          <div className="bg-white border rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow">
            <div>
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-1">
                <BadgePercent className="w-5 h-5" /> EMI Calculator
              </h2>
              <p className="text-gray-500 text-sm mb-3">Estimate your monthly repayments before applying.</p>
              <form onSubmit={handleEmiSubmit} className="flex flex-wrap items-center gap-2">
                <input type="number" name="amount" min="1000" placeholder="Amount" value={emiFields.amount} onChange={handleEmiChange}
                  className="bg-gray-50 border px-2 py-1 rounded-md w-28 text-sm focus:ring-2 ring-blue-200" />
                <input type="number" name="term" min="1" max="60" placeholder="Months" value={emiFields.term} onChange={handleEmiChange}
                  className="bg-gray-50 border px-2 py-1 rounded-md w-20 text-sm" />

                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Check EMI
                </button>
                {emiResult!==null && (
                  <div className="ml-4 text-blue-700 font-semibold text-sm flex items-center gap-2">
                    Monthly EMI: {formatCurr(emiResult)}
                  </div>
                )}
              </form>
            </div>
            <div className="flex flex-col space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Receipt className="w-4 h-4" /> Interest-free Loans/Advances with quick disbursal</div>
              <div className="flex items-center gap-1"><Info className="w-4 h-4" /> No hidden charges, fair and transparent process</div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Form */}
          <motion.section initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Apply for a {section==='loan'?'Loan':'Advance'}
            </h2>
            <p className="text-gray-500 mb-3 text-sm">
              Submit details below for a new {section==='loan'?'loan':'advance'}. Required: supporting document (salary slip, declaration, or emergency proof).
            </p>
            {successMsg && (
              <div className="flex items-center mb-4 rounded-lg bg-green-100 p-3 text-green-800 font-medium">
                <CheckCircle className="w-5 h-5 mr-1" /> {successMsg}
                <button onClick={()=>setSuccessMsg('')} className="ml-auto focus:outline-none"><X className="w-5 h-5" /></button>
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  {section==='loan' ? 'Loan Type' : 'Advance Type'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  { types[section].map(typeOpt => (
                    <option key={typeOpt} value={typeOpt}>{typeOpt}</option>
                  ))}
                </select>
              </div>
              {/* Amount */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1000"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="Enter amount"
                  className={`w-full bg-gray-50 border rounded-md py-2 px-3 ${errors.amount?'border-red-500':'border-gray-300'} text-gray-700 focus:ring-2 focus:ring-blue-500`}
                />
                {errors.amount && <p className="text-red-600 text-sm mt-1 flex items-center"><Info className="w-4 h-4 mr-1"/>{errors.amount}</p>}
              </div>
              {/* Term */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Term (Months) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="termMonths"
                  min="1"
                  max="60"
                  value={form.termMonths}
                  onChange={handleFormChange}
                  placeholder="e.g. 12"
                  className={`w-full bg-gray-50 border rounded-md py-2 px-3 ${errors.termMonths?'border-red-500':'border-gray-300'} text-gray-700 focus:ring-2 focus:ring-blue-500`}
                />
                {errors.termMonths && <p className="text-red-600 text-sm mt-1 flex items-center"><Info className="w-4 h-4 mr-1"/>{errors.termMonths}</p>}
              </div>
              {/* Reason */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  value={form.reason}
                  onChange={handleFormChange}
                  placeholder="Explain need and usage"
                  className={`w-full bg-gray-50 border rounded-md py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 resize-none ${errors.reason?'border-red-500':'border-gray-300'}`}
                ></textarea>
                {errors.reason && <p className="text-red-600 text-sm mt-1 flex items-center"><Info className="w-4 h-4 mr-1"/>{errors.reason}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md text-md transition disabled:bg-blue-300"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <SendHorizontal className="w-5 h-5 mr-2"/> }
                {submitting ? "Submitting..." : "Apply"}
              </button>
            </form>
          </motion.section>

          {/* Records Section */}
          <motion.section initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.22}} className="bg-white rounded-xl shadow p-6 border min-h-[450px] max-h-[650px] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">My {section==='loan'?'Loans':'Advances'}</h2>
            {records.filter(r => r.category===section).length === 0 ? (
              <div className="text-gray-500 text-md py-10 flex items-center justify-center">No {section==='loan'?'loan':'advance'} applications yet.</div>
            ) : (
              records.filter(r => r.category===section).map(rec => (
                <div key={rec.id} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-blue-700">{rec.type}</span> <span className="text-sm text-gray-500">#{rec.id}</span>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(rec.appliedDate)}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize font-bold ${rec.status==='approved'?'bg-green-100 text-green-700':rec.status==='pending'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>{rec.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <div className="flex items-center gap-1"><Banknote className="w-4 h-4 text-blue-700"/> {formatCurr(rec.amount)}</div>
                    <div className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-purple-700"/>Term: {rec.termMonths} months</div>
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-700"/>EMI: {formatCurr(rec.emi)}</div>
                    <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-700"/>Balance: {formatCurr(rec.remaining)}</div>
                  </div>
                  <div className="w-full mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${rec.status==='approved'?'bg-green-500':rec.status==='pending'?'bg-yellow-400':'bg-red-500'}`}
                      style={{ width: `${Math.min(rec.progress, 100)}%`}}
                    ></div>
                  </div>
                  {rec.remarks && <div className="text-xs italic text-gray-500 mt-1">{rec.remarks}</div>}
                </div>
              ))
            )}
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};

export default LoansAndAdvances;
