import { API, notification } from '@/services';
import getLoanById from '@/services/LoansAdvances/GetLoansByEmployee';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PayrollService from '@/services/Payroll/payrollService';
import React, { use, useEffect, useMemo, useState } from 'react';
import { FaMoneyCheckAlt, FaClipboardList, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { BadgePercent, Info, Receipt, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import ViewActive from './../ViewActive/ViewActive';
import { Employees } from '@/services';

const LoanAdvanceManagement = () => {
  const notify = notification();

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  // EMI Calculator State
  const [emiFields, setEmiFields] = useState({ amount: '', term: '' });
  const [emiResult, setEmiResult] = useState(null);
  const [isApprovedBy, setIsApprovedBy] = useState('');

  // Loan form states
  const initialFormState = {
    monthlyInstallment: '',
    amount: '',
    reason: '',
    startDate: '' // optional; if provided, will be used as StartDate
  };
  const [form, setForm] = useState(initialFormState);

  // Requests for selected employee
  const [request, setRequest] = useState([]);

  // Derived values
  const period = useMemo(() => {
    const amt = parseFloat(form.amount);
    const emi = parseFloat(form.monthlyInstallment);
    if (!amt || !emi || emi === 0) return '';
    const p = Math.ceil(amt / emi);
    // Show up to 2 decimals (or whole if integer)
    return Number.isFinite(p) ? (Number.isInteger(p) ? p : p.toFixed(2)) : '';
  }, [form.amount, form.monthlyInstallment]);

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const list = await getAllDepartments();
        setDepartments(list || []);
      } catch (err) {
        console.error('Failed to load departments', err);
        notify.error('Failed to load departments');
      }
    };
    loadDepartments();
  }, []);

  // Load employees when department changes
  useEffect(() => {
    const loadEmployees = async () => {
      if (!deptId) {
        setEmployees([]);
        setSelectedEmpId('');
        setRequest([]);
        return;
      }
      try {
        const list = await PayrollService.getEmployeesByDepartment(deptId);
        setEmployees(Array.isArray(list) ? list : []);
        setSelectedEmpId('');
        setRequest([]);
      } catch (err) {
        console.error('Failed to load employees', err);
        notify.error('Failed to load employees');
      }
    };
    loadEmployees();
  }, [deptId]);

  // Load requests when employee changes
  useEffect(() => {
    const loadEmployeeRequests = async () => {
      if (!selectedEmpId) {
        setRequest([]);
        return;
      }
      try {
        const data = await getLoanById.getLoanByEmp(selectedEmpId);
        setRequest(Array.isArray(data) ? data : (data ? [data] : []));
        console.log(data);
      } catch (err) {
        console.error('Failed to load employee requests', err);
        notify.error('Failed to load loan requests');
      }
    };
    loadEmployeeRequests();

  }, [selectedEmpId]);
  

  const handleSubmit = async () => {
    // Basic validations
    const amount = parseFloat(form.amount);
    const emi = parseFloat(form.monthlyInstallment);

    if (!selectedEmpId) return notify.error('Please select an employee');
    if (!amount || amount <= 0) return notify.error('Enter a valid amount');
    if (!emi || emi <= 0) return notify.error('Enter a valid monthly installment');
    if (!form.reason?.trim()) return notify.error('Please enter a reason');

    const period  = Math.ceil(amount / emi);
    const payload = {
      EmpID: parseInt(selectedEmpId),
      LoanAmount: amount,
      Period: period,
      InterestRate: 0,
      MonthlyInstallment: emi,
      StartDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      IsApproved: false,
      Description: form.reason.trim()
    };

    try {
      const response = await API.post('/LnAs', payload);
      console.log('Response:', response.data);
      notify.success('Loan request submitted successfully!');
      // Reload requests for this employee
      const data = await getLoanById.getLoanByEmp(selectedEmpId);
      setRequest(Array.isArray(data) ? data : (data ? [data] : []));
      setForm(initialFormState);
    } catch (error) {
      console.error('Submission failed:', error);
      notify.error('There was an error submitting the request.');
    }
  };

  const isFormDisabled = !selectedEmpId;
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

  return (
    <>
      <div className="p-6 md:p-5 bg-gradient-to-br from-gray-100 to-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">💼 Loans & Advances Management</h1>
        <ViewActive />

        {/* EMI Calculator */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
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
                {emiResult !== null && (
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


        {/* Selection Panel */}
        <div className="bg-white shadow-lg p-6 rounded-lg mb-8 transition hover:shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardList className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Select Department & Employee</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Department */}
            <label className="block">
              <span className="text-gray-700">Department</span>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>
                ))}
              </select>
            </label>

            {/* Employee */}
            <label className="block md:col-span-2">
              <span className="text-gray-700">Employee</span>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                disabled={!deptId || employees.length === 0}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
              >
                <option value="">{!deptId ? 'Select department first' : employees.length ? 'Select employee' : 'No employees found'}</option>
                {employees.map((emp) => (
                  <option key={emp.EmpID} value={emp.EmpID}>
                    {emp.EmpID} - {emp.FirstName} {emp.LastName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Request Form */}
          <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl  col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FaMoneyCheckAlt className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Create Loan/Advance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-gray-700">Amount</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Enter amount"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Monthly Installment</span>
                <input
                  type='number'
                  value={form.monthlyInstallment}
                  onChange={(e) => setForm({ ...form, monthlyInstallment: e.target.value })}
                  disabled={isFormDisabled || !form.amount}
                  placeholder='Enter monthly installment'
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500">Period: {period || '-'}</p>
              </label>
              <label className="block">
                <span className="text-gray-700">Start Date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  placeholder="Select start date"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
              <label className="block col-span-2">
                <span className="text-gray-700">Reason</span>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Enter reason"
                  rows="3"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isFormDisabled}
              className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2 rounded shadow"
            >
              Submit Request
            </button>
          </div>

          {/* Repayment Info (static placeholder) */}
          {/* <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FaHistory className="text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Repayment Status</h2>
            </div>
            <p className="text-gray-800 text-md mb-1">
              <strong>Outstanding Balance:</strong> ₹10,000
            </p>
            <p className="text-gray-800 text-md mb-3">
              <strong>Next EMI:</strong> ₹1,000 on <span className="text-blue-600 font-medium">1st Aug 2025</span>
            </p>
            <div>
              <p className="text-gray-700 mb-2 font-semibold">Repayment History:</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>1st Jul 2025 - ₹1,000 - <span className="text-green-600">Paid</span></li>
                <li>1st Jun 2025 - ₹1,000 - <span className="text-green-600">Paid</span></li>
              </ul>
            </div>
          </div> */}

          {/* Request Status - Multiple Loans */}
          <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FaCheckCircle className="text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Loan Request Status</h2>
            </div>

            {!selectedEmpId ? (
              <p className="text-gray-600">Select a department and employee to view loan requests.</p>
            ) : !request || request.length === 0 ? (
              <p className="text-gray-600">No loan requests found.</p>
            ) : (
              <ul className="space-y-4">
                {request.map((loan) => (
                  <li key={loan.LnAID} className="border p-4 rounded-md bg-gray-50">
                    <p className="text-md text-gray-800"><strong>Loan Amount:</strong> ₹{loan.LoanAmount}</p>
                    <p className="text-md text-gray-800"><strong>Installments:</strong> {loan.Installment}</p>
                    <p className="text-md text-gray-800"><strong>Start Date:</strong> {loan.StartDate ? new Date(loan.StartDate).toLocaleDateString() : '-'}</p>
                    <p className="text-md text-gray-800"><strong>Reason:</strong> {loan.Description || 'Not Available'}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${loan.IsApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {loan.IsApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <p className="text-md text-gray-800"><strong>Approved By:</strong>
                      {loan.IsApprovedByName || 'Not Available'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>



      </div>
    </>
  );
}

export default LoanAdvanceManagement;