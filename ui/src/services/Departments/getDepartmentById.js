// src/services/getDepartmentById.js
import API from '@/services/API';

/**
 * Fetch a department by its ID.
 * @param {number|string} id - Department ID to fetch.
 * @returns {Promise<object>} Department data.
 * @throws {Error} Throws error on failure.
 */
const getDepartmentById = async (id) => {
  try {
    const response = await API.get(`/Departments/${id}`);

    if (!response.data) {
      throw new Error('Invalid server response');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching department:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.message || 'Server Error';
      throw new Error(`Server error (${statusCode}): ${message}`);
    } else if (error.request) {
      throw new Error('Network error: No response received');
    } else {
      throw new Error(error.message || 'Unexpected error');
    }
  }
};

export default getDepartmentById;
