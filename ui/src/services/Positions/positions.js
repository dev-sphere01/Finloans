// src/services/PositionService.js
import API from '@/services/API';

/**
 * Fetches all positions from the server.
 * @returns {Promise<Array>} List of position objects
 */
const getAllPositions = async () => {
  try {
    const response = await API.get('/Positions');

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: Expected an array');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);

    if (error.response) {
      throw new Error(`Server error (${error.response.status}): ${error.response.data?.message || error.response.data}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};


/**
 * Creates a new position under a department
 * @param {Object} id
 * @returns {Promise<Object>} The created position
 */
const createPosition = async (id) => {
  try {
    const payload = {
      DeptID: id.DeptID,
      PositionName: id.PositionName.trim(),
      ReportsTo: Array.isArray(id.ReportsTo) ? id.ReportsTo : [],
    };

    const response = await API.post('/Positions', payload);

    if (!response.data) {
      throw new Error('Failed to create position - no response data');
    }

    return response.data;
  } catch (error) {
    console.error('Error in createPosition:', error);

    if (error.response) {
      throw new Error(`Server error (${error.response.status}): ${error.response.data?.message || error.response.data}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Fetch a position by its ID.
 * @param {number|string} id - Position ID to fetch.
 * @returns {Promise<object>} Position data.
 * @throws {Error} Throws error on failure.
 */
const getPositionById = async (id) => {
  try {
    const response = await API.get(`/Positions/${id}`);

    if (!response.data) {
      throw new Error('Invalid server response');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching position:', error);

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


/**
 * Updates an existing position
 * @param {number|string} id - Position ID to update
 * @param {Object} positionData - Position data to update
 * @param {number} positionData.PositionID - Position ID
 * @param {number} positionData.DeptID - Department ID
 * @param {string} positionData.PositionName - Position name
 * @param {Array<number>} positionData.ReportsTo - Array of position IDs this position reports to
 * @returns {Promise<Object>} The updated position
 */
const editPosition = async (id, positionData) => {
  try {
    const payload = {
      PositionID: positionData.PositionID,
      DeptID: positionData.DeptID,
      PositionName: positionData.PositionName?.trim(),
      ReportsTo: Array.isArray(positionData.ReportsTo) ? positionData.ReportsTo : [],
    };

    const response = await API.put(`/Positions/${id}`, payload);

    // Handle different response scenarios
    if (response.status === 200 || response.status === 204) {
      // If status is 204 (No Content), the update was successful but no data returned
      if (response.status === 204 || !response.data) {
        return { 
          success: true, 
          message: 'Position updated successfully',
          ...payload // Return the payload as confirmation
        };
      }
      return response.data;
    } else {
      throw new Error('Failed to update position - unexpected response status');
    }
  } catch (error) {
    console.error('Error in editPosition:', error);

    if (error.response) {
      throw new Error(`Server error (${error.response.status}): ${error.response.data?.message || error.response.data}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Fetches positions by department ID
 * @param {number|string} departmentId - Department ID to fetch positions for
 * @returns {Promise<Array>} List of position objects for the specified department
 */
const getPositionsByDepartment = async (departmentId) => {
  try {
    const response = await API.get(`/Positions/GetPositionsByDepartment/${departmentId}`);

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: Expected an array');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching positions by department:', error);

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



const PositionService = {
  getAllPositions,
  createPosition,
  getPositionById,
  editPosition,
  getPositionsByDepartment
};

export default PositionService;
