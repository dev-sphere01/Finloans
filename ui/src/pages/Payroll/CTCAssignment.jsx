import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { notification, PayrollService } from '@/services';
import getAllDepartments from '@/services/Departments/getAllDepartments';

const CTCAssignment = () => {
  const notify = notification();

  // Form state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [ctcAmount, setCTCAmount] = useState('');
  const [ctcPeriod, setCTCPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [inputMode, setInputMode] = useState('percentage'); // 'percentage' or 'amount'
  const [epfApplicable, setEpfApplicable] = useState(true);
  const [professionalTaxApplicable, setProfessionalTaxApplicable] = useState(true);
  const [esiApplicable, setEsiApplicable] = useState(true);

  // Hourly wage specific state
  const [hourlyRate, setHourlyRate] = useState('');
  const [workingHours, setWorkingHours] = useState(240); // Default 200 hours
  const [isHourlyEmployee, setIsHourlyEmployee] = useState(false);

  // Manual tax and deduction inputs
  const [manualDeductions, setManualDeductions] = useState({
    epfEmployee: '',
    epfEmployer: '',
    esiEmployee: '',
    esiEmployer: '',
    professionalTax: '',
    incomeTax: '',
    rd: '',
    healthInsurance: ''
  });

  // Clear manual deductions when period changes
  useEffect(() => {
    setManualDeductions({
      epfEmployee: '',
      epfEmployer: '',
      esiEmployee: '',
      esiEmployer: '',
      professionalTax: '',
      incomeTax: '',
      rd: '',
      healthInsurance: ''
    });
  }, [ctcPeriod]);

  // Data states
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Component configuration
  const [components, setComponents] = useState({
    basicSalary: { percentage: 50, amount: 0, label: 'Basic Salary' },
    hra: { percentage: 30, amount: 0, label: 'HRA' },
    da: { percentage: 20, amount: 0, label: 'DA' },
    lta: { percentage: 0, amount: 0, label: 'LTA' },
    specialAllowance: { percentage: 0, amount: 0, label: 'Special Allowance' },
    performanceBonus: { percentage: 0, amount: 0, label: 'Performance Bonus' }
  });



  // Load departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getAllDepartments();
        setDepartments(response);
      } catch (error) {
        notify.error('Failed to load departments');
      }
    };
    fetchDepartments();
  }, []);

  // Load employees when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const fetchEmployees = async () => {
        try {
          setLoading(true);
          const response = await PayrollService.getEmployeesByDepartment(selectedDepartment);
          setEmployees(response);
        } catch (error) {
          notify.error('Failed to load employees');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    } else {
      setEmployees([]);
      setSelectedEmployee('');
      setSelectedEmployeeData(null);
      setIsHourlyEmployee(false);
    }
  }, [selectedDepartment]);

  // Handle employee selection and determine if hourly
  useEffect(() => {
    if (selectedEmployee && employees.length > 0) {
      const employeeData = employees.find(emp => emp.EmpID === parseInt(selectedEmployee));
      if (employeeData) {
        setSelectedEmployeeData(employeeData);
        console.log("Selected Employee:", selectedEmployeeData);
        // Check if employee is hourly based on API response
        const isHourly = employeeData.EmpTypeID === 2;
        setIsHourlyEmployee(isHourly);

        // Reset hourly rate when switching employees
        if (isHourly) {
          setHourlyRate('0');
          setCTCAmount('0'); // Clear CTC when switching to hourly mode
        }
      }
    } else {
      setSelectedEmployeeData(null);
      setIsHourlyEmployee(false);
    }
  }, [selectedEmployee, employees]);

  // Calculate CTC breakdown
  const calculations = useMemo(() => {
    // The `ctcAmount` is now treated as the Gross Salary input from the user.
    const grossSalaryInput = parseFloat(ctcAmount) || 0;
    let computedHourlyRateForReturn = 0;

    // Determine gross salary for the current period (monthly/yearly)
    const grossSalaryForPeriod = grossSalaryInput;
    const monthlyGrossSalary = ctcPeriod === 'yearly' ? grossSalaryForPeriod / 12 : grossSalaryForPeriod;
    const yearlyGrossSalary = ctcPeriod === 'monthly' ? grossSalaryForPeriod * 12 : grossSalaryForPeriod;

    // Calculate component amounts based on gross salary
    const earnings = {};
    if (isHourlyEmployee) {
      // For hourly employees, the entire gross is considered basic pay for calculation purposes.
      const hoursNum = parseFloat(workingHours) || 0;
      computedHourlyRateForReturn = hoursNum > 0 ? Math.round(monthlyGrossSalary / hoursNum) : 0;

      // All gross is assigned to basic salary; other components are zero.
      earnings.basicSalary = grossSalaryForPeriod;
      earnings.hra = 0;
      earnings.da = 0;
      earnings.lta = 0;
      earnings.specialAllowance = 0;
      earnings.performanceBonus = 0;
    } else {
      // For salaried employees, distribute gross salary among components.
      if (inputMode === 'percentage') {
        let totalPercentage = 0;
        Object.keys(components).forEach(key => {
          totalPercentage += components[key].percentage;
        });

        Object.entries(components).forEach(([key, comp]) => {
          if (totalPercentage > 0) {
            // Distribute based on the ratio of each component's percentage to the total percentage.
            earnings[key] = (grossSalaryForPeriod * comp.percentage) / totalPercentage;
          } else {
            earnings[key] = 0;
          }
        });
      } else {
        // In 'amount' mode, the entered amounts are used directly.
        Object.entries(components).forEach(([key, comp]) => {
          earnings[key] = comp.amount || 0;
        });
      }
    }

    // Recalculate gross salary from the sum of components to ensure consistency.
    const grossSalary = Object.values(earnings).reduce((sum, amount) => sum + amount, 0);

    // EPF calculations (based on basic salary)
    const epfLimit = ctcPeriod === 'yearly' ? 21600 : 1800;
    const basicForEpf = ctcPeriod === 'yearly' ? earnings.basicSalary / 12 : earnings.basicSalary;
    const calculatedEpfEmployee = epfApplicable ? Math.min(basicForEpf * 0.12, 1800) : 0;
    const epfEmployee = manualDeductions.epfEmployee !== '' ? parseFloat(manualDeductions.epfEmployee) || 0 : (ctcPeriod === 'yearly' ? calculatedEpfEmployee * 12 : calculatedEpfEmployee);

    const calculatedEpfEmployer = epfApplicable ? calculatedEpfEmployee : 0;
    const epfEmployer = manualDeductions.epfEmployer !== '' ? parseFloat(manualDeductions.epfEmployer) || 0 : (ctcPeriod === 'yearly' ? calculatedEpfEmployer * 12 : calculatedEpfEmployer);

    // ESI calculations (based on monthly gross salary)
    const monthlyGrossForEsi = ctcPeriod === 'yearly' ? grossSalary / 12 : grossSalary;
    const calculatedEsiEmployee = 0;
    const esiEmployee = manualDeductions.esiEmployee !== '' ? parseFloat(manualDeductions.esiEmployee) || 0 : 0;

    const calculatedEsiEmployer = 0;
    const esiEmployer = manualDeductions.esiEmployer !== '' ? parseFloat(manualDeductions.esiEmployer) || 0 : 0;

    // Total Employer Contribution
    const totalEmployerContribution = epfEmployer + esiEmployer;

    // Calculate Total CTC = Gross Salary + Total Employer Contribution
    const totalCTC = grossSalary + totalEmployerContribution;
    const monthlyCtc = ctcPeriod === 'yearly' ? totalCTC / 12 : totalCTC;
    const yearlyCtc = ctcPeriod === 'yearly' ? totalCTC : totalCTC * 12;
    const currentPeriodCtc = ctcPeriod === 'yearly' ? yearlyCtc : monthlyCtc;

    // Tax calculations (always calculated annually, then converted to period)
    const standardDeduction = 75000; // Default standard deduction
    const yearlyTaxableIncome = Math.max(0, yearlyGrossSalary - standardDeduction);

    // EPF and ESI were already calculated, this is a redundant block.

    // Professional Tax - always 0 for auto calculation, user must enter manually
    const ptThreshold = ctcPeriod === 'yearly' ? 180000 : 15000; // Annual: 1.8L, Monthly: 15K
    const ptAmount = ctcPeriod === 'yearly' ? 2880 : 240; // Annual: 2400, Monthly: 200
    const calculatedProfessionalTax = 0; // Always 0 - user must calculate and enter manually
    const professionalTax = manualDeductions.professionalTax !== '' ? parseFloat(manualDeductions.professionalTax) || 0 : 0;

    // Income Tax calculation - always 0 for auto calculation, user must enter manually
    let yearlyCalculatedIncomeTax = 0; // Always 0 - user must calculate and enter manually

    // Health and Education Cess (4% of income tax) - also 0 since base income tax is 0
    const yearlyHealthEducationCess = yearlyCalculatedIncomeTax * 0.04;
    const yearlyTotalIncomeTax = yearlyCalculatedIncomeTax + yearlyHealthEducationCess;

    // Convert to current period - always 0 since calculation is disabled
    const calculatedTotalIncomeTax = 0;

    // Use only manual input or default to 0
    const totalIncomeTax = manualDeductions.incomeTax !== '' ? parseFloat(manualDeductions.incomeTax) || 0 : 0;

    // Additional manual deductions: RD and Health Insurance
    const rdAmount = manualDeductions.rd !== '' ? parseFloat(manualDeductions.rd) || 0 : 0;
    const healthInsuranceAmount = manualDeductions.healthInsurance !== '' ? parseFloat(manualDeductions.healthInsurance) || 0 : 0;

    // Total deductions
    const totalDeductions = epfEmployee + esiEmployee + professionalTax + totalIncomeTax + rdAmount + healthInsuranceAmount;

    // Net salary (current period)
    const netSalary = grossSalary - totalDeductions;
    const netAnnualSalary = ctcPeriod === 'yearly' ? netSalary : netSalary * 12;
    const netMonthlySalary = ctcPeriod === 'monthly' ? netSalary : netSalary / 12;

    // This was already calculated; no need to redeclare.
    // const totalEmployerContribution = epfEmployer + esiEmployer;

    // Convert values for display based on period
    const displayTaxableIncome = ctcPeriod === 'yearly' ? yearlyTaxableIncome : yearlyTaxableIncome / 12;
    const displayStandardDeduction = ctcPeriod === 'yearly' ? standardDeduction : standardDeduction / 12;

    return {
      yearlyCtc,
      monthlyCtc,
      currentPeriodCtc,
      earnings,
      grossSalary,
      standardDeduction: displayStandardDeduction,
      taxableIncome: displayTaxableIncome,
      deductions: {
        epfEmployee,
        epfEmployer,
        esiEmployee,
        esiEmployer,
        professionalTax,
        incomeTax: totalIncomeTax,
        rd: rdAmount,
        healthInsurance: healthInsuranceAmount,
        totalDeductions
      },
      calculatedValues: {
        epfEmployee: calculatedEpfEmployee,
        epfEmployer: calculatedEpfEmployer,
        esiEmployee: calculatedEsiEmployee,
        esiEmployer: calculatedEsiEmployer,
        professionalTax: calculatedProfessionalTax,
        incomeTax: calculatedTotalIncomeTax
      },
      netSalary,
      netAnnualSalary,
      netMonthlySalary,
      totalEmployerContribution,
      finalCtc: isHourlyEmployee ? grossSalary + totalEmployerContribution : currentPeriodCtc,
      // expose rounded hourly for UI and saving
      computedHourlyRate: computedHourlyRateForReturn
    };
  }, [ctcAmount, ctcPeriod, components, inputMode, epfApplicable, professionalTaxApplicable, esiApplicable, manualDeductions, isHourlyEmployee, hourlyRate, workingHours]);

  // Handle component change
  const handleComponentChange = (componentKey, field, value) => {
    setComponents(prev => ({
      ...prev,
      [componentKey]: {
        ...prev[componentKey],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Handle manual deduction change
  const handleManualDeductionChange = (field, value) => {
    setManualDeductions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save CTC assignment
  const handleSave = async () => {
    if (!selectedDepartment || !selectedEmployee) {
      notify.error('Please select department and employee');
      return;
    }

    if (isHourlyEmployee) {
      if (!ctcAmount || parseFloat(ctcAmount) <= 0) {
        notify.error('Please enter a valid monthly basic amount');
        return;
      }
      if (!workingHours || parseFloat(workingHours) <= 0) {
        notify.error('Please enter valid working hours');
        return;
      }
    } else {
      if (!ctcAmount || parseFloat(ctcAmount) <= 0) {
        notify.error('Please enter a valid CTC amount');
        return;
      }
    }

    try {
      setLoading(true);

      // Convert all values to MONTHLY for API submission (regardless of UI display period)
      const isYearlyPeriod = ctcPeriod === 'yearly';
      const divideByTwelve = (value) => isYearlyPeriod ? (value || 0) / 12 : (value || 0);

      // Format data according to API's expected structure - ALL VALUES IN MONTHLY TERMS
      const ctcData = {
        EmpCtcID: 0, // New assignment, so ID is 0
        EmpID: parseInt(selectedEmployee),
        // Monthly CTC for API
        CtcAmount: isHourlyEmployee
          ? calculations.monthlyCtc
          : (isYearlyPeriod ? (parseFloat(ctcAmount) || 0) / 12 : parseFloat(ctcAmount) || 0),
        IsHourlyEmployee: isHourlyEmployee,
        // Use computed rounded hourly rate
        HourlyRate: isHourlyEmployee ? (calculations.computedHourlyRate || 0) : 0,
        WorkingHours: isHourlyEmployee ? parseFloat(workingHours) || 0 : 0,
        // Monthly basic equals entered amount for hourly employees
        MonthlyBasicPay: isHourlyEmployee ? (isYearlyPeriod ? (parseFloat(ctcAmount) || 0) / 12 : parseFloat(ctcAmount) || 0) : 0,
        // Convert salary components to monthly
        BasicSalary: divideByTwelve(calculations.earnings.basicSalary),
        Hra: divideByTwelve(calculations.earnings.hra),
        Da: divideByTwelve(calculations.earnings.da),
        Lta: divideByTwelve(calculations.earnings.lta),
        SpecialAllowance: divideByTwelve(calculations.earnings.specialAllowance),
        PerformanceBonus: divideByTwelve(calculations.earnings.performanceBonus),
        // Convert gross salary to monthly
        GrossSalary: divideByTwelve(calculations.grossSalary),
        // Keep annual salary as is (since it's explicitly "Annual")
        NetAnnualSalary: calculations.netAnnualSalary || 0,
        // Monthly net payable
        NetMonthlyPayable: calculations.netMonthlySalary || 0,
        // Convert deductions to monthly
        EPFEmployee: divideByTwelve(calculations.deductions.epfEmployee),
        RD: divideByTwelve(calculations.deductions.rd || 0),
        HealthInsurance: divideByTwelve(calculations.deductions.healthInsurance || 0),
        EpfApplicable: epfApplicable,
        ProfessionalTaxApplicable: professionalTaxApplicable,
        EsiApplicable: esiApplicable,
        EffectiveDate: new Date().toISOString()
      };

      // Call API to save the CTC assignment
      await PayrollService.assignEmployeeCTC(ctcData);

      // Clear form after successful assignment
      setSelectedEmployee('');
      setSelectedEmployeeData(null);
      setCTCAmount('0');
      setHourlyRate('0');
      setIsHourlyEmployee(false);

    } catch (error) {
      notify.error('Failed to assign CTC: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">CTC Assignment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - CTC Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Cost to Company (CTC)</h2>

          {/* Department and Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.DeptID} value={dept.DeptID}>
                    {dept.DeptName} - ({dept.DeptID})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={!selectedDepartment || loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Employee</option>
                {/* {employees.map((emp) => (
                  <option key={emp.EmpID} value={emp.EmpID}>
                    {emp.FirstName} {emp.LastName} ({emp.EmpID})
                  </option>
                ))} */}
                {employees
                  .slice() // avoid mutating original state
                  .sort((a, b) => a.FirstName.localeCompare(b.FirstName))
                  .map((emp) => (
                    <option key={emp.EmpID} value={emp.EmpID}>
                      {emp.FirstName} {emp.LastName} ({emp.EmpID})
                    </option>
                  ))}

              </select>
            </div>
          </div>

          {/* Employee Type Display */}
          {selectedEmployeeData && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-700">
                    Employee Type:
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${isHourlyEmployee ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedEmployeeData.EmpType} {isHourlyEmployee ? 'Wage Employee' : 'Salary Employee'}
                  </span>
                  <span>
                    <span className="text-xs text-gray-500">
                      {selectedEmployeeData.PositionName}
                    </span>
                  </span>
                </div>
                {/* CTC Range Information */}
                <div className="text-xs text-gray-600">
                  CTC Range: ₹{selectedEmployeeData.MinCTC?.toLocaleString('en-IN')} - ₹{selectedEmployeeData.MaxCTC?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Amount Input (for both types). For hourly employees, this is the monthly basic including HRA/DA */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">₹</span>
              <input
                type="number"
                value={ctcAmount}
                onChange={(e) => setCTCAmount(e.target.value)}
                className="text-2xl font-bold w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12,500"
              />
              <span className="text-sm text-gray-500">{ctcPeriod}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {isHourlyEmployee ? (
                <>
                  Enter the {ctcPeriod} basic salary (includes HRA/DA). Hourly rate = round(basic / hours) = ₹{calculations.computedHourlyRate?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} per hour.
                </>
              ) : (
                <>Enter your {ctcPeriod} Cost to Company (CTC) amount in Indian Rupees.</>
              )}
            </p>
            {!isHourlyEmployee && selectedEmployeeData && (
              <>
                <span className="text-blue-600">
                  💡 Suggested CTC range for this employee:
                  {ctcPeriod === 'yearly' ? (
                    <span className="font-medium"> ₹{(selectedEmployeeData.MinCTC * 12).toLocaleString('en-IN')} - ₹{(selectedEmployeeData.MaxCTC * 12).toLocaleString('en-IN')} (annually)</span>
                  ) : (
                    <span className="font-medium"> ₹{selectedEmployeeData.MinCTC?.toLocaleString('en-IN')} - ₹{selectedEmployeeData.MaxCTC?.toLocaleString('en-IN')} (monthly)</span>
                  )}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  Average CTC: ₹{ctcPeriod === 'yearly' ? (selectedEmployeeData.AverageCTC * 12).toLocaleString('en-IN') : selectedEmployeeData.AverageCTC?.toLocaleString('en-IN')} ({ctcPeriod})
                </span>
              </>
            )}
          </div>

          {/* Monthly/Yearly Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCTCPeriod('monthly')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${ctcPeriod === 'monthly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCTCPeriod('yearly')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${ctcPeriod === 'yearly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Yearly
            </button>
          </div>

          {/* Advanced Settings */}
          <div className="border-t pt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              Advanced Settings
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvanced && (
              <div className="space-y-6">
                {/* Customize Components */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Customize Components</h3>

                  {/* Input Mode Toggle */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input Mode:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="percentage"
                          checked={inputMode === 'percentage'}
                          onChange={(e) => setInputMode(e.target.value)}
                          className="mr-2"
                        />
                        Percentage
                      </label>
                      <label className={`flex items-center ${isHourlyEmployee ? 'text-gray-400' : ''}`}>
                        <input
                          type="radio"
                          value="amount"
                          checked={inputMode === 'amount'}
                          onChange={(e) => setInputMode(e.target.value)}
                          disabled={isHourlyEmployee}
                          className="mr-2"
                        />
                        Amount ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                        {isHourlyEmployee && (
                          <span className="ml-2 text-xs text-orange-600">(Not available for hourly employees)</span>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Component Configuration */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>Component</span>
                      <span>{inputMode === 'percentage' ? 'Percentage' : `Amount (${ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})`}</span>
                    </div>

                    {isHourlyEmployee && (
                      <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        ℹ️ For hourly employees, components are calculated as percentages of the basic pay (Hourly Rate × Hours). Only percentage mode is supported.
                      </div>
                    )}

                    {Object.entries(components).map(([key, component]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{component.label}</span>
                          <Info size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={inputMode === 'percentage' ? component.percentage : component.amount}
                          onChange={(e) => handleComponentChange(
                            key,
                            inputMode === 'percentage' ? 'percentage' : 'amount',
                            e.target.value
                          )}
                          disabled={isHourlyEmployee && inputMode === 'amount'}
                          className={`w-20 p-2 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isHourlyEmployee && inputMode === 'amount' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          min="0"
                          max={inputMode === 'percentage' ? '100' : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>



                {/* Working Hours Configuration (for hourly employees) */}
                {isHourlyEmployee && (
                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Hourly Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Working Hours per Month
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={workingHours}
                          onChange={(e) => setWorkingHours(parseFloat(e.target.value) || 0)}
                          className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          placeholder="200"
                        />
                        <span className="text-sm text-gray-500">hours/month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Default: 240 hours/month (standard working hours). Adjust as needed for this employee.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tax Applicability */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={epfApplicable}
                      onChange={(e) => setEpfApplicable(e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">EPF Applicable</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={esiApplicable}
                      onChange={(e) => setEsiApplicable(e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">ESI Applicable</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={professionalTaxApplicable}
                      onChange={(e) => setProfessionalTaxApplicable(e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Professional Tax Applicable</span>
                  </label>
                </div>

                {/* Manual Deduction Inputs */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Manual Deduction Override</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave fields empty to use calculated values. Enter custom {ctcPeriod === 'yearly' ? 'annual' : 'monthly'} amounts to override calculations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* EPF Employee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        EPF Employee ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.epfEmployee}
                          onChange={(e) => handleManualDeductionChange('epfEmployee', e.target.value)}
                          placeholder={`Auto: ₹${calculations.calculatedValues.epfEmployee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>

                    {/* EPF Employer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        EPF Employer ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.epfEmployer}
                          onChange={(e) => handleManualDeductionChange('epfEmployer', e.target.value)}
                          placeholder={`Auto: ₹${calculations.calculatedValues.epfEmployer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>

                    {/* Professional Tax */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Tax ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.professionalTax}
                          onChange={(e) => handleManualDeductionChange('professionalTax', e.target.value)}
                          placeholder={`Auto: ₹${calculations.calculatedValues.professionalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>

                    {/* Income Tax */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Income Tax ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.incomeTax}
                          onChange={(e) => handleManualDeductionChange('incomeTax', e.target.value)}
                          placeholder={`Auto: ₹${calculations.calculatedValues.incomeTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>

                    {/* RD (Recurring Deposit) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RD ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.rd}
                          onChange={(e) => handleManualDeductionChange('rd', e.target.value)}
                          placeholder="Enter amount"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>

                    {/* Health Insurance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Health Insurance ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={manualDeductions.healthInsurance}
                          onChange={(e) => handleManualDeductionChange('healthInsurance', e.target.value)}
                          placeholder="Enter amount"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">₹</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setManualDeductions({
                        epfEmployee: calculations.calculatedValues.epfEmployee.toString(),
                        epfEmployer: calculations.calculatedValues.epfEmployer.toString(),
                        professionalTax: calculations.calculatedValues.professionalTax.toString(),
                        incomeTax: calculations.calculatedValues.incomeTax.toString(),
                        rd: '',
                        healthInsurance: ''
                      })}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Use Calculated Values
                    </button>
                    <button
                      onClick={() => setManualDeductions({
                        epfEmployee: '',
                        epfEmployer: '',
                        professionalTax: '',
                        incomeTax: '',
                        rd: '',
                        healthInsurance: ''
                      })}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={loading || !selectedDepartment || !selectedEmployee ||
                (isHourlyEmployee ? (!ctcAmount || parseFloat(ctcAmount) <= 0 || !workingHours || parseFloat(workingHours) <= 0) : (!ctcAmount || parseFloat(ctcAmount) <= 0))}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : `Assign ${isHourlyEmployee ? 'Hourly Rate' : 'CTC'}`}
            </button>
          </div>
        </div>

        {/* Right Panel - Salary Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">
              {isHourlyEmployee ? 'Hourly Wage Breakdown (2025-2026)' : 'Salary Breakdown (2025-2026)'}
            </h2>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-600 px-1 rounded">M</span>
                <span>= Manual Override</span>
              </div>
            </div>
          </div>

          {/* Hourly Employee Info */}
          {isHourlyEmployee && parseFloat(ctcAmount) > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Hourly Calculation</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span>₹{(calculations.computedHourlyRate || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Working Hours/Month:</span>
                  <span>{workingHours} hours</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Monthly Basic Pay:</span>
                  <span>₹{(ctcPeriod === 'yearly' ? ((parseFloat(ctcAmount) || 0) / 12) : (parseFloat(ctcAmount) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="text-xs text-orange-700 mt-2 pt-1 border-t">
                  <div>📊 For hourly employees, HRA and DA are considered included in the basic. Other components are set to 0.</div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                Net {ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'} Salary
              </div>
              <div className="text-2xl font-bold text-green-600">
                ₹{calculations.netSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                Net {ctcPeriod === 'yearly' ? 'Monthly Equivalent' : 'Annual Equivalent'}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{ctcPeriod === 'yearly' ? calculations.netMonthlySalary.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : calculations.netAnnualSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Earnings</h3>
            <div className="space-y-2">
              {Object.entries(calculations.earnings).map(([key, amount]) => {
                const component = components[key];
                if (amount === 0) return null;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span>{component.label}</span>
                    <span>₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gross Salary */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-semibold">
              <span>Gross Salary</span>
              <span>₹{calculations.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Tax Information */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-red-600">
              <span>Standard Deduction ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'})</span>
              <span>-₹{calculations.standardDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Taxable Income ({ctcPeriod === 'yearly' ? 'Annual' : 'Monthly'}) (before other deductions)</span>
              <span>₹{calculations.taxableIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Deductions</h3>
            <div className="space-y-2 text-sm">
              {calculations.deductions.epfEmployee > 0 && (
                <div className="flex justify-between text-red-600">
                  <div className="flex items-center gap-1">
                    <span>EPF (Employee)</span>
                    {manualDeductions.epfEmployee !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>-₹{calculations.deductions.epfEmployee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {calculations.deductions.epfEmployee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>EPF (Employer)</span>
                    {manualDeductions.epfEmployer !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>₹{calculations.deductions.epfEmployer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {calculations.deductions.esiEmployee > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>ESI</span>
                  <span>-₹{calculations.deductions.esiEmployee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {calculations.deductions.professionalTax > 0 && (
                <div className="flex justify-between text-red-600">
                  <div className="flex items-center gap-1">
                    <span>Professional Tax</span>
                    {manualDeductions.professionalTax !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>-₹{calculations.deductions.professionalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {calculations.deductions.incomeTax > 0 && (
                <div className="flex justify-between text-red-600">
                  <div className="flex items-center gap-1">
                    <span>Income Tax</span>
                    {manualDeductions.incomeTax !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>-₹{calculations.deductions.incomeTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}

              {calculations.deductions.rd > 0 && (
                <div className="flex justify-between text-red-600">
                  <div className="flex items-center gap-1">
                    <span>RD (Recurring Deposit)</span>
                    {manualDeductions.rd !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>-₹{calculations.deductions.rd.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}

              {calculations.deductions.healthInsurance > 0 && (
                <div className="flex justify-between text-red-600">
                  <div className="flex items-center gap-1">
                    <span>Health Insurance</span>
                    {manualDeductions.healthInsurance !== '' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                    )}
                  </div>
                  <span>-₹{calculations.deductions.healthInsurance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
            <div className="flex justify-between font-semibold text-red-600 mb-4">
              <span>Total Deductions</span>
              <span>-₹{calculations.deductions.totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Cost to Company Breakup</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Salary</span>
                  <span>₹{calculations.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {calculations.deductions.epfEmployer > 0 && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span>Employer EPF Contribution</span>
                      {manualDeductions.epfEmployer !== '' && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Manual override">M</span>
                      )}
                    </div>
                    <span>₹{calculations.deductions.epfEmployer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {calculations.deductions.esiEmployer > 0 && (
                  <div className="flex justify-between">
                    <span>Employer ESI Contribution</span>
                    <span>₹{calculations.deductions.esiEmployer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total CTC</span>
                    <span>₹{calculations.finalCtc.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTCAssignment;
