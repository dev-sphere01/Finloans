import React, { useState, useMemo, use, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Calendar, DollarSign, FileText, CheckCircle, User, Building } from 'lucide-react';

// components
import Payslips from "./components/Payslips";
import Salary from './components/Salary';
import SummaryCards from '@/pages/EmployeePages/SalaryAndPaylips/components/SummaryCards';
import Slip from '@/pages/EmployeePages/SalaryAndPaylips/components/Slip';

// sample data imports
import payslipData from './sample/payslipData.json';
import empAndCoData from './sample/emp&CoData.json';

import useEmpDataStore from '@/store/empDataStore';
import BankService from '@/services/Bank/bank';

const SalaryAndPayslips = () => {

  // Get employee data store
  const {
    currentEmployee,
    fetchEmployeeById,
    getEmployeeDisplayName,
    loading,
    error
  } = useEmpDataStore();
  console.log("Current Employee", currentEmployee?.EmpID);
  // Pull last 3 slips from JSON; if more exist, we only show last 3
  const slips = useMemo(() => (payslipData?.salarySlips ?? []).slice(-3), []);

  // Select the latest slip by default
  const [selectedIndex, setSelectedIndex] = useState(Math.max(slips.length - 1, 0));
  const [searchTerm, setSearchTerm] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exportNow, setExportNow] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  useEffect(() => {
    fetchBankDetails();
    // {
    //   "EbdID": 0,
    //   "EmpID": 0,
    //   "BankName": "string",
    //   "AccountNumber": "string",
    //   "IFSCCode": "string",
    //   "BranchName": "string",
    //   "CancelledCheque": "string"
    // }
    console.log("Bank Details", bankDetails);
  }, [currentEmployee?.EmpID]);

  const fetchBankDetails = async () => {
    if (!currentEmployee?.EmpID) return;

    try {
      const bankData = await BankService.getBankById(currentEmployee.EmpID);
      setBankDetails(bankData);
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };



  // Merge slip with employee/company data for downstream components
  const currentSlip = slips[selectedIndex] ?? {};
  const currentData = {
    ...currentSlip,
    employee: empAndCoData?.employee ?? {},
    company: empAndCoData?.company ?? {},
    bankDetails,
    status: 'paid' // default badge if needed
  };

  // Safely sum numeric values from objects; if explicit totals exist in JSON, prefer them
  const sumNumeric = (obj = {}) => Object.entries(obj)
    .filter(([, v]) => typeof v === 'number')
    .reduce((s, [, v]) => s + (v ?? 0), 0);

  const calculateTotals = (data) => {
    const earnings = data?.earnings ?? {};
    const deductions = data?.deductions ?? {};

    const totalEarnings = (typeof earnings.total === 'number') ? earnings.total : sumNumeric(earnings);
    const totalDeductions = (typeof deductions.total === 'number') ? deductions.total : sumNumeric(deductions);

    const netPay = (data?.netSalary && typeof data.netSalary.amount === 'number')
      ? data.netSalary.amount
      : totalEarnings - totalDeductions;

    return { totalEarnings, totalDeductions, netPay };
  };

  const { totalEarnings, totalDeductions, netPay } = calculateTotals(currentData);

  const formatCurrency = (amount) => {
    const a = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(a);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? String(dateString)
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePreview = (index) => {
    setPreviewData(slips[index]);
    setShowPreview(true);
    setExportNow(false);
  };

  const handleDownload = (index) => {
    // Open preview and auto-trigger export
    setPreviewData(slips[index]);
    setShowPreview(true);
    setExportNow(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter slips by "period" text
  const filteredSlips = slips.filter(s => (s?.period ?? '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className=" bg-gray-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-between items-start"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Pay Slips</h1>
            <p className="text-gray-600 text-sm">Download and view your salary slips for the last 3 months</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
              <FileText className="h-4 w-4" />
              <span>Tax Statement</span>
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <SummaryCards
          currentData={currentData}
          formatCurrency={formatCurrency}
          netPay={netPay}
          formatDate={formatDate}
          motion={motion}
          DollarSign={DollarSign}
          Calendar={Calendar}
          Building={Building}
          User={User}
        />

        {/* Main Content - Side by Side */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Pay Slip List */}
          <Payslips
            slips={filteredSlips}
            setSelectedIndex={setSelectedIndex}
            handlePreview={handlePreview}
            handleDownload={handleDownload}
            motion={motion}
            calculateTotals={calculateTotals}
            getStatusColor={getStatusColor}
            CheckCircle={CheckCircle}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            Eye={Eye}
            Download={Download}
            FileText={FileText}
          />

          {/* Right Side - Pay Slip Preview */}
          <div className="space-y-4">
            <Salary
              currentData={currentData}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              motion={motion}
              totalEarnings={totalEarnings}
              totalDeductions={totalDeductions}
              netPay={netPay}
            />

            {/* Modal preview of official Slip with mapped data */}
            {showPreview && previewData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowPreview(false)}
                />
                {/* Modal content */}
                <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-lg shadow-lg overflow-hidden">
                  <div className="flex justify-between items-center border-b px-4 py-3">
                    <h4 className="font-semibold text-gray-800">Payslip Preview — {previewData.period}</h4>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </div>
                  <div className="overflow-auto p-3">
                    <Slip data={{
                      ...previewData,
                      employee: empAndCoData?.employee ?? {},
                      company: empAndCoData?.company ?? {},
                      bankDetails: bankDetails
                    }} autoExport={exportNow} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SalaryAndPayslips;