// src/services/Employees/updateAcadById.js
import API from '@/services/API';
import getAcadById from './getAcadById';

/**
 * Updates academic details for a specific employee
 * @param {number|string} empId - The employee ID (used for validation)
 * @param {Object} academicDetail - Single academic detail object (must include EadID)
 * @returns {Promise<Object>} Promise that resolves to the API response
 * @throws {Error} Throws error if update fails
 */
const updateAcadById = async (empId, academicDetail) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }

    if (!academicDetail || typeof academicDetail !== 'object') {
      throw new Error('Academic detail object is required');
    }

    if (!academicDetail.EadID) {
      throw new Error('EadID is required for updating academic details');
    }

    // Validate the academic detail object
    if (!academicDetail.Degree?.trim()) {
      throw new Error('Degree is required');
    }
    if (!academicDetail.Institution?.trim()) {
      throw new Error('Institution is required');
    }
    if (!academicDetail.YearOfPassing?.trim()) {
      throw new Error('Year of passing is required');
    }
    if (!academicDetail.Grade?.trim()) {
      throw new Error('Grade is required');
    }

    // Update academic details with empId in URL as per API specification
    console.log('Sending request body:', JSON.stringify(academicDetail, null, 2));
    const response = await API.put(`/EmpAcadDetails/${empId}`, academicDetail);

    // PUT request returns NoContent (204) on success, so response.data will be empty
    console.log('API Response status:', response.status);

    if (response.status === 204) {
      // Success - return the updated academic detail
      return academicDetail;
    }

    // If we get here, something unexpected happened
    console.log('Unexpected response:', response);
    return response.data || academicDetail;
  } catch (error) {
    console.error('Error updating academic details:', error);

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
 * Adds or updates academic detail for an employee (single entry only)
 * @param {number|string} empId - The employee ID
 * @param {Object} academicDetail - Academic detail object
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
const addOrUpdateAcademicDetail = async (empId, academicDetail) => {
  try {
    const newDetail = {
      EadID: academicDetail.EadID || 0,
      EmpID: parseInt(empId),
      Degree: academicDetail.Degree,
      Institution: academicDetail.Institution,
      YearOfPassing: academicDetail.YearOfPassing,
      Grade: academicDetail.Grade
    };

    return await updateAcadById(empId, newDetail);
  } catch (error) {
    throw error;
  }
};

export {
  addOrUpdateAcademicDetail
};

export default updateAcadById;