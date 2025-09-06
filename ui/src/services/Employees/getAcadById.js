// src/services/Employees/getAcadById.js
import API from '@/services/API';

/**
 * Fetches academic details for a specific employee by employee ID
 * @param {number|string} empId - The employee ID to fetch academic details for
 * @returns {Promise<Array>} Promise that resolves to the academic details array
 * @throws {Error} Throws error if academic details fetch fails
 */
const getAcadById = async (empId) => {
  try {
    const response = await API.get(`/EmpAcadDetails/${empId}`);

    if (!response.data) {
      throw new Error('Invalid response format: No academic data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching academic details:', error);

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

export default getAcadById;