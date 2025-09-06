import API from '@/services/API';
import { notification } from '@/services';

const notify = notification();

/**
 * Get employees by department ID
 * @param {number} deptId - Department ID
 * @returns {Promise<Array>} List of employees in the department
 */
const getEmployeesByDepartment = async (deptId) => {
  try {
    const response = await API.get(`/Departments/GetEmployeebydepartment?id=${deptId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    notify.error('Failed to fetch employees: ' + (error.response?.data?.message || error.message));
    return [];
  }
};

/**
 * Create employee payroll assignment
 * @param {Object} payrollData - Payroll data to submit
 * @returns {Promise<Object>} Created payroll record
 */
const createEmployeePayroll = async (payrollData) => {
  try {
    const response = await API.post('/EmpPayrolls', payrollData);
    notify.success('Employee payroll assigned successfully!');
    return response.data;
  } catch (error) {
    console.error('Error creating employee payroll:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to assign payroll';
    notify.error('Error: ' + errorMessage);
    throw error;
  }
};

/**
 * Update employee payroll assignment
 * @param {number} empPayrollId - Payroll ID to update
 * @param {Object} payrollData - Updated payroll data
 * @returns {Promise<Object>} Updated payroll record
 */
const updateEmployeePayroll = async (empPayrollId, payrollData) => {
  try {
    const response = await API.put(`/EmpPayroll/${empPayrollId}`, payrollData);
    notify.success('Employee payroll updated successfully!');
    return response.data;
  } catch (error) {
    console.error('Error updating employee payroll:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update payroll';
    notify.error('Error: ' + errorMessage);
    throw error;
  }
};

/**
 * Get employee payroll by employee ID
 * @param {number} empId - Employee ID
 * @returns {Promise<Object>} Employee payroll data
 */
const getEmployeePayroll = async (empId) => {
  try {
    const response = await API.get(`/EmpPayroll/employee/${empId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    if (error.response?.status === 404) {
      return null; // No payroll found for employee
    }
    notify.error('Failed to fetch payroll data: ' + (error.response?.data?.message || error.message));
    throw error;
  }
};

/**
 * Search employees with basic info (name, empId)
 * @param {string} searchTerm - Search term
 * @param {number} deptId - Department ID filter
 * @returns {Promise<Array>} List of employees matching search
 */
const searchEmployees = async (searchTerm, deptId = null) => {
  try {
    const payload = {
      Query: searchTerm,
      PageNumber: 1,
      PageSize: 50,
      isActive: true
    };
    
    if (deptId) {
      payload.DeptID = deptId;
    }

    const response = await API.post('/Employees/Search', payload);
    return response.data?.employees || response.data || [];
  } catch (error) {
    console.error('Error searching employees:', error);
    notify.error('Failed to search employees: ' + (error.response?.data?.message || error.message));
    return [];
  }
};

/**
 * Assign CTC to employee
 * @param {Object} ctcData - CTC assignment data
 * @returns {Promise<Object>} Created CTC assignment record
 */
const assignEmployeeCTC = async (ctcData) => {
  try {
    const response = await API.post('/EmpCTCandPayrolls', ctcData);
    notify.success('Employee CTC assigned successfully!');
    return response.data;
  } catch (error) {
    console.error('Error assigning employee CTC:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to assign CTC';
    notify.error('Error: ' + errorMessage);
    throw error;
  }
};

const PayrollService = {
  getEmployeesByDepartment,
  createEmployeePayroll,
  updateEmployeePayroll,
  getEmployeePayroll,
  searchEmployees,
  assignEmployeeCTC
};

export default PayrollService;