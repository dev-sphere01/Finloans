// src/services/Employees/getBankById.js
import API from '@/services/API';

/**
 * Fetches bank details for a specific employee by employee ID
 * @param {number|string} empId - The employee ID to fetch bank details for
 * @returns {Promise<Object>} Promise that resolves to the bank details data
 * @throws {Error} Throws error if bank details fetch fails
 */
const getBankById = async (empId) => {
  try {
    const response = await API.get(`/EmpBankDetails/${empId}`); 
    console.log(response.data);

    if (!response.data) {
      throw new Error('Invalid response format: No bank data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching bank details:', error);

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

export default getBankById;