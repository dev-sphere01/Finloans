// src/services/deleteDepartment.js
import API from '@/services/API';

/**
 * Deletes a department by its ID.
 * @param {number} deptId - Department ID to delete.
 * @returns {Promise<void>} Resolves if successful.
 * @throws {Error} Throws error on failure.
 */
const deleteDepartment = async (deptId) => {
  try {
    const response = await API.delete(`/Departments/${deptId}`);

    // Some delete endpoints return 204 No Content
    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Unexpected response status');
    }

    return; // Success, no need to return response.data
  } catch (error) {
    console.error('Error deleting department:', error);

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

export default deleteDepartment;
