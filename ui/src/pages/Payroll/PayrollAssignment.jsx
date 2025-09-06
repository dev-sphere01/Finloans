import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Building2, Calculator, Calendar, DollarSign, Minus, Plus } from 'lucide-react';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import payrollService from '@/services/Payroll/payrollService';
import notification from '@/services/NotificationService';

const PayrollAssignment = () => {
  const notify = notification();
  
  // State management
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formEnabled, setFormEnabled] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    empID: 0,
    basicSalary: '',
    hra: '',
    da: '',
    hourlyRate: '',
    otherAllowances: '',
    grossSalary: 0,
    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    otherDeductions: '',
    totalDeductions: 0,
    netSalary: 0,
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load employees when department changes
  useEffect(() => {
    if (selectedDepartment) {
      loadEmployeesByDepartment(selectedDepartment);
    } else {
      setEmployees([]);
      setFilteredEmployees([]);
      resetEmployeeSelection();
    }
  }, [selectedDepartment]);

  // Filter employees based on search term
  useEffect(() => {
    if (employees.length > 0) {
      const filtered = employees.filter(emp => 
        `${emp.FirstName} ${emp.LastName}`.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        emp.EmpID.toString().includes(employeeSearchTerm)
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, employeeSearchTerm]);

  // Calculate derived values when relevant fields change
  useEffect(() => {
    calculateGrossSalary();
  }, [formData.basicSalary, formData.hra, formData.da, formData.otherAllowances]);

  useEffect(() => {
    calculateTotalDeductions();
  }, [formData.providentFund, formData.professionalTax, formData.incomeTax, formData.otherDeductions]);

  useEffect(() => {
    calculateNetSalary();
  }, [formData.grossSalary, formData.totalDeductions]);

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const deptData = await getAllDepartments();
      setDepartments(deptData);
    } catch (error) {
      notify.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  // Load employees by department
  const loadEmployeesByDepartment = async (deptId) => {
    try {
      setLoading(true);
      const empData = await payrollService.getEmployeesByDepartment(deptId);
      setEmployees(empData);
      setFilteredEmployees(empData);
    } catch (error) {
      notify.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Reset employee selection
  const resetEmployeeSelection = () => {
    setSelectedEmployee('');
    setEmployeeSearchTerm('');
    setFormEnabled(false);
    setFormData(prev => ({
      ...prev,
      empID: 0,
      basicSalary: '',
      hra: '',
      da: '',
      hourlyRate: '',
      otherAllowances: '',
      grossSalary: 0,
      providentFund: '',
      professionalTax: '',
      incomeTax: '',
      otherDeductions: '',
      totalDeductions: 0,
      netSalary: 0,
    }));
    setErrors({});
  };

  // Handle department selection
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    resetEmployeeSelection();
  };

  // Handle employee selection
  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee.EmpID);
    setEmployeeSearchTerm(`${employee.FirstName} ${employee.LastName} (Employee ID: ${employee.EmpID})`);
    setIsEmployeeDropdownOpen(false);
    setFormEnabled(true);
    
    // Update form data with employee ID
    setFormData(prev => ({
      ...prev,
      empID: employee.EmpID
    }));

    // Check if employee already has payroll assigned
    try {
      const existingPayroll = await payrollService.getEmployeePayroll(employee.EmpID);
      if (existingPayroll) {
        // Pre-fill form with existing data
        setFormData(prev => ({
          ...prev,
          basicSalary: existingPayroll.basicSalary?.toString() || '',
          hra: existingPayroll.hra?.toString() || '',
          da: existingPayroll.da?.toString() || '',
          hourlyRate: existingPayroll.hourlyRate?.toString() || '',
          otherAllowances: existingPayroll.otherAllowances?.toString() || '',
          providentFund: existingPayroll.providentFund?.toString() || '',
          professionalTax: existingPayroll.professionalTax?.toString() || '',
          incomeTax: existingPayroll.incomeTax?.toString() || '',
          otherDeductions: existingPayroll.otherDeductions?.toString() || '',
          effectiveFrom: existingPayroll.effectiveFrom ? new Date(existingPayroll.effectiveFrom).toISOString().split('T')[0] : prev.effectiveFrom
        }));
        notify.info('Existing payroll data loaded for editing');
      }
    } catch (error) {
      // No existing payroll found, proceed with empty form
      console.log('No existing payroll found for employee');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate gross salary
  const calculateGrossSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const da = parseFloat(formData.da) || 0;
    const other = parseFloat(formData.otherAllowances) || 0;
    
    const gross = basic + hra + da + other;
    
    setFormData(prev => ({
      ...prev,
      grossSalary: gross
    }));
  };

  // Calculate total deductions
  const calculateTotalDeductions = () => {
    const pf = parseFloat(formData.providentFund) || 0;
    const pt = parseFloat(formData.professionalTax) || 0;
    const it = parseFloat(formData.incomeTax) || 0;
    const other = parseFloat(formData.otherDeductions) || 0;
    
    const total = pf + pt + it + other;
    
    setFormData(prev => ({
      ...prev,
      totalDeductions: total
    }));
  };

  // Calculate net salary
  const calculateNetSalary = () => {
    const net = formData.grossSalary - formData.totalDeductions;
    
    setFormData(prev => ({
      ...prev,
      netSalary: Math.max(0, net) // Ensure net salary is not negative
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.empID) {
      newErrors.employee = 'Please select an employee';
    }

    if (!formData.basicSalary || parseFloat(formData.basicSalary) <= 0) {
      newErrors.basicSalary = 'Basic salary is required and must be greater than 0';
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = 'Effective date is required';
    }

    // Validate that the effective date is not in the past (allow today)
    const selectedDate = new Date(formData.effectiveFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.effectiveFrom = 'Effective date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error('Please correct the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare payload
      const payload = {
        EmpID: formData.empID,
        BasicSalary: parseFloat(formData.basicSalary) || 0,
        HRA: parseFloat(formData.hra) || 0,
        DA: parseFloat(formData.da) || 0,
        HourlyRate: parseFloat(formData.hourlyRate) || 0,
        OtherAllowances: parseFloat(formData.otherAllowances) || 0,
        GrossSalary: formData.grossSalary,
        ProvidentFund: parseFloat(formData.providentFund) || 0,
        ProfessionalTax: parseFloat(formData.professionalTax) || 0,
        IncomeTax: parseFloat(formData.incomeTax) || 0,
        OtherDeductions: parseFloat(formData.otherDeductions) || 0,
        TotalDeductions: formData.totalDeductions,
        NetSalary: formData.netSalary,
        EffectiveFrom: new Date(formData.effectiveFrom).toISOString()
      };

      await payrollService.createEmployeePayroll(payload);
      
      // Reset form after successful submission
      resetEmployeeSelection();
      setSelectedDepartment('');
      
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Payroll Assignment</h1>
                <p className="text-sm text-gray-600">Assign and manage employee salary structures</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department and Employee Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Employee Selection
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.DeptID} value={dept.DeptID}>
                          {dept.DeptName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employee Search Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => {
                        setEmployeeSearchTerm(e.target.value);
                        setIsEmployeeDropdownOpen(true);
                      }}
                      onFocus={() => setIsEmployeeDropdownOpen(true)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.employee ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder={selectedDepartment ? "Search employees..." : "Select department first"}
                      disabled={!selectedDepartment || loading}
                    />
                    
                    {/* Employee Dropdown */}
                    {isEmployeeDropdownOpen && selectedDepartment && filteredEmployees.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.EmpID}
                            onClick={() => handleEmployeeSelect(employee)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {employee.FirstName} {employee.LastName}
                                </p>
                                <p className="text-sm text-gray-600">Employee ID: {employee.EmpID}</p>
                              </div>
                              {/* {employee.workEmail && (
                                <p className="text-sm text-gray-500">{employee.workEmail}</p>
                              )} */}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No employees found */}
                    {isEmployeeDropdownOpen && selectedDepartment && filteredEmployees.length === 0 && employeeSearchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                        <p className="text-gray-500 text-center">No employees found</p>
                      </div>
                    )}
                  </div>
                  {errors.employee && (
                    <p className="text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.employee}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Details Form */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${
            !formEnabled ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-green-600" />
                Salary Structure
              </h2>
            </div>
            <div className="p-6">
              {/* Earnings Section */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Plus className="h-4 w-4 mr-2 text-green-600" />
                  Earnings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Basic Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      step="0.01"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.basicSalary ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                    {errors.basicSalary && (
                      <p className="text-sm text-red-600">{errors.basicSalary}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">HRA</label>
                    <input
                      type="number"
                      name="hra"
                      value={formData.hra}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">DA</label>
                    <input
                      type="number"
                      name="da"
                      value={formData.da}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Other Allowances</label>
                    <input
                      type="number"
                      name="otherAllowances"
                      value={formData.otherAllowances}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>
                </div>

                {/* Hourly Rate - separate row */}
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Hourly Rate</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        placeholder="0.00"
                        disabled={!formEnabled}
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                        <p className="text-sm text-green-700 font-medium">Gross Salary</p>
                        <p className="text-xl font-bold text-green-800">{formatCurrency(formData.grossSalary)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Minus className="h-4 w-4 mr-2 text-red-600" />
                  Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Provident Fund</label>
                    <input
                      type="number"
                      name="providentFund"
                      value={formData.providentFund}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Professional Tax</label>
                    <input
                      type="number"
                      name="professionalTax"
                      value={formData.professionalTax}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Income Tax</label>
                    <input
                      type="number"
                      name="incomeTax"
                      value={formData.incomeTax}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Other Deductions</label>
                    <input
                      type="number"
                      name="otherDeductions"
                      value={formData.otherDeductions}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                      disabled={!formEnabled}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">Total Deductions</p>
                    <p className="text-xl font-bold text-red-800">{formatCurrency(formData.totalDeductions)}</p>
                  </div>
                </div>
              </div>

              {/* Net Salary and Effective Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium">Net Salary</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(formData.netSalary)}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Effective From <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="effectiveFrom"
                      value={formData.effectiveFrom}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.effectiveFrom ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={!formEnabled}
                    />
                  </div>
                  {errors.effectiveFrom && (
                    <p className="text-sm text-red-600">{errors.effectiveFrom}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    resetEmployeeSelection();
                    setSelectedDepartment('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  disabled={submitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!formEnabled || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {submitting && (
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{submitting ? 'Assigning...' : 'Assign Payroll'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollAssignment;