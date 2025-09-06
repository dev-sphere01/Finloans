// src/services/Employees/getDocsById.js
import API from '@/services/API';

/**
 * Fetches document details for a specific employee by employee ID
 * @param {number|string} empId - The employee ID to fetch document details for
 * @returns {Promise<Array>} Promise that resolves to the document details array
 * @throws {Error} Throws error if document details fetch fails
 */
const getDocsById = async (empId) => {
  try {
    const response = await API.get(`/EmpDocs/${empId}`);

    if (!response.data) {
      throw new Error('Invalid response format: No document data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching document details:', error);

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

export default getDocsById;