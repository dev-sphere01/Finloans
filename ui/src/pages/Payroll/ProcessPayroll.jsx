import React, { useState, useEffect, useMemo } from 'react';
import API from '@/services/API';
import notification from '@/services/NotificationService';
import TableService from '@/services/TableService';
import { DollarSign, Calendar, Users, ChevronsRight } from 'lucide-react';
import ExcelExporter from '@/services/ExportExcelService';


const ProcessPayroll = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const years = useMemo(() => [...Array(10).keys()].map(i => new Date().getFullYear() - 5 + i), []);
  const months = useMemo(() => [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ], []);

  const fetchPayrollData = async (year, month) => {
    setLoading(true);
    try {
      const response = await API.get(`/MonthlyPayrollTransactions/PayrollTransactionDetails/${year}/${month}`);
      setPayrollData(response.data);
      console.log(payrollData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPayrollData(null);
      } else {
        notification().error("Failed to fetch payroll data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchPayrollData(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  const handleProcessPayroll = async () => {
    setProcessing(true);
    try {
      await API.post(`/MonthlyPayrollTransactions?month=${selectedMonth}&year=${selectedYear}`);
      notification().success('Payroll processed successfully! Fetching updated details...');
      await fetchPayrollData(selectedYear, selectedMonth);
    } catch (error) {
      notification().error("Failed to process payroll. Check if payroll for this month is already processed.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

  const columns = useMemo(() => {
    if (!payrollData || !payrollData.Transactions || payrollData.Transactions.length === 0) {
      return [];
    }

    const headers = [
      { accessorKey: 'EmployeeName', header: 'Employee' },
      { accessorKey: 'BasicSalary', header: 'Basic' },
      { accessorKey: 'HRA', header: 'HRA' },
      { accessorKey: 'DA', header: 'DA' },
      { accessorKey: 'Advances', header: 'Advances' },
      { accessorKey: 'LoanAndAdvanceRepayment', header: 'Loan Repayment' },
      { accessorKey: 'Deductions', header: 'Deductions' },
      { accessorKey: 'NetPay', header: 'Net Pay' },
      { accessorKey: 'BankName', header: 'Bank' },
      { accessorKey: 'AccountNumber', header: 'Account Number' },
    ];

    return headers.map(header => ({
      ...header,
      cell: ({ row }) => {
        const value = row.original[header.accessorKey];
        if (['BasicSalary', 'HRA', 'DA', 'Advances', 'LoanAndAdvanceRepayment', 'Deductions', 'NetPay'].includes(header.accessorKey)) {
          return <span className="text-right">{formatCurrency(value)}</span>;
        }
        return value !== null ? String(value) : <span className="text-gray-400">N/A</span>;
      }
    }));
  }, [payrollData]);

  const stats = useMemo(() => {
    if (!payrollData) return { netSalary: 0, totalTransactions: 0, avgSalary: 0 };
    const netSalary = payrollData.NetSalaryToBeTransferred || 0;
    const totalTransactions = payrollData.Transactions?.length || 0;
    const avgSalary = totalTransactions > 0 ? netSalary / totalTransactions : 0;
    return { netSalary, totalTransactions, avgSalary };
  }, [payrollData]);

  const sheetConfigs = [
    {
      sheetName: "INDIAN BANK",
      filter: (row) => row.BankName === "INDIAN BANK",
    },
    {
      sheetName: "UNION BANK OF INDIA",
      filter: (row) => row.BankName === "UNION BANK OF INDIA",
    },
    {
      sheetName: "Others",
      filter: (row) =>
        row.BankName !== "INDIAN BANK" && row.BankName !== "UNION BANK OF INDIA",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Process Payroll</h1>
          <p className="text-gray-600">Select a period and process the monthly payroll for all employees.</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">

          <div>
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <div className="relative">
              <select
                id="year-select"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <div className="relative">
              <select
                id="month-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            onClick={handleProcessPayroll}
            disabled={processing || loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white font-semibold transition w-full md:w-auto ${processing || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            <ChevronsRight size={16} />
            {processing ? 'Processing...' : 'Process Payroll'}
          </button>


          <ExcelExporter
            data={payrollData?.Transactions || []}
            sheetConfigs={sheetConfigs}
            disabled={!payrollData}
            fileName="PayrollData.xlsx" />


        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <p>Loading payroll data...</p>
        </div>
      ) : payrollData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"><DollarSign size={16} /> Net Salary Transferred</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.netSalary)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"><Users size={16} /> Employees Processed</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar size={16} /> Average Salary</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgSalary)}</p>
            </div>


          </div>

          <TableService
            columns={columns}
            data={payrollData.Transactions}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            initialPageSize={10}
            serverPagination={false}
          />
        </>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700">No Payroll Data</h3>
          <p className="text-gray-500 mt-2">No payroll has been processed for the selected period.</p>
          <p className="text-gray-500 mt-1">You can process it using the button above.</p>
        </div>
      )}
    </div>
  );
};

export default ProcessPayroll;
