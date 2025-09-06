// src/services/createDepartment.js
import API from '@/services/API';

/**
 * Creates a new department
 * @param {Object} departmentData - The department data
 * @param {string} departmentData.deptName - The department name
 * @returns {Promise<Object>} Promise that resolves to the created department data
 * @throws {Error} Throws error if department creation fails
 */
const createDepartment = async (departmentData) => {
  try {
    const { deptName } = departmentData;

    const departmentPayload = {
      DeptName: deptName.trim()
    };

    console.log('Creating department with payload:', departmentPayload);

    const departmentResponse = await API.post('/Departments', departmentPayload);

    if (!departmentResponse.data) {
      throw new Error('Failed to create department - no response data');
    }

    const createdDepartment = departmentResponse.data;

    console.log('Department created successfully:', createdDepartment);
    return createdDepartment;

  } catch (error) {
    console.error('Error in createDepartment service:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Validates department data before sending to API
 * @param {Object} departmentData - The department data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
const validateDepartmentData = (departmentData) => {
  const errors = [];

  if (!departmentData) {
    errors.push('Department data is required');
    return { isValid: false, errors };
  }

  const { deptName } = departmentData;

  if (!deptName || typeof deptName !== 'string' || !deptName.trim()) {
    errors.push('Department name is required');
  } else if (deptName.trim().length < 2) {
    errors.push('Department name must be at least 2 characters long');
  } else if (deptName.trim().length > 50) {
    errors.push('Department name must not exceed 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const DepartmentService = {
  createDepartment,
  validateDepartmentData
};

export default DepartmentService;


