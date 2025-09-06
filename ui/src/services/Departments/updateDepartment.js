// src/services/updateDepartment.js
import API from '@/services/API';

/**
 * Updates a department by its ID.
 * @param {number|string} deptId - Department ID.
 * @param {string} deptName - Department name.
 * @returns {Promise<void>} Resolves if successful.
 */
const updateDepartment = async (deptId, deptName) => {
  try {
    const payload = {
      DeptID: deptId,
      DeptName: deptName,
    };

    const response = await API.put(`/Departments/${deptId}`, payload);

    // Accept 204 or any successful status (2xx)
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    return response.data || {}; // Allow empty response
  } catch (error) {
    console.error('Error updating department:', error);

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

export default updateDepartment;
