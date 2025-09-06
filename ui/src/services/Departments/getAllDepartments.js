// src/services/getAllDepartments.js
import API from '@/services/API';

/**
 * Fetches all departments from the server.
 * @returns {Promise<Array>} List of department objects with DeptID and DeptName
 * @throws {Error} Throws an error if the fetch fails
 */
const getAllDepartments = async () => {
  try {
    const response = await API.get('/Departments');

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: Expected an array');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);

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

export default getAllDepartments;
