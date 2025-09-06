// src/services/Employees/empProfileDetails.js
import API from '@/services/API';

/**
 * Gets professional details for a specific employee
 * @param {number|string} empId - The employee ID
 * @returns {Promise<Object>} Promise that resolves to the professional details
 * @throws {Error} Throws error if fetch fails
 */
export const getProfById = async (empId) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }

    const response = await API.get(`/EmpProfDetails/${empId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format: No data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching professional details:', error);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw error;
    }
  }
};

/**
 * Updates professional details for a specific employee
 * @param {number|string} empId - The employee ID
 * @param {Object} professionalDetail - Professional detail object
 * @returns {Promise<Object>} Promise that resolves to the API response
 * @throws {Error} Throws error if update fails
 */
export const updateProfById = async (empId, professionalDetail) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }

    if (!professionalDetail || typeof professionalDetail !== 'object') {
      throw new Error('Professional detail object is required');
    }

    if (!professionalDetail.EpdID) {
      throw new Error('EpdID is required for updating professional details');
    }

    // Validate the professional detail object
    if (!professionalDetail.PreviousCompany?.trim()) {
      throw new Error('Previous company is required');
    }
    if (!professionalDetail.PreviousPosition?.trim()) {
      throw new Error('Previous position is required');
    }
    if (!professionalDetail.PreviousExperience?.trim()) {
      throw new Error('Previous experience is required');
    }

    console.log('Sending request body:', JSON.stringify(professionalDetail, null, 2));
    const response = await API.put(`/EmpProfDetails/${empId}`, professionalDetail);

    // PUT request returns NoContent (204) on success, so response.data will be empty
    console.log('API Response status:', response.status);

    if (response.status === 204) {
      // Success - return the updated professional detail
      return professionalDetail;
    }

    // If we get here, something unexpected happened
    console.log('Unexpected response:', response);
    return response.data || professionalDetail;
  } catch (error) {
    console.error('Error updating professional details:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw error;
    }
  }
};

/**
 * Adds or updates professional details for an employee
 * @param {number|string} empId - The employee ID
 * @param {Object} professionalDetail - Professional detail object
 * @param {File} certificateFile - Optional certificate file
 * @returns {Promise<Object>} Promise that resolves to the created/updated professional detail
 * @throws {Error} Throws error if operation fails
 */
export const addOrUpdateProfessionalDetail = async (empId, professionalDetail, certificateFile = null) => {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('EmpID', parseInt(empId));
    formData.append('PreviousCompany', professionalDetail.PreviousCompany || '');
    formData.append('PreviousPosition', professionalDetail.PreviousPosition || '');
    formData.append('PreviousExperience', professionalDetail.PreviousExperience || '');

    // Add certificate file if provided
    if (certificateFile) {
      formData.append('PrevExpCert', certificateFile);
    }

    console.log('Adding professional detail with FormData');
    console.log('EmpID:', empId);
    console.log('PreviousCompany:', professionalDetail.PreviousCompany);
    console.log('PreviousPosition:', professionalDetail.PreviousPosition);
    console.log('PreviousExperience:', professionalDetail.PreviousExperience);
    console.log('Certificate file:', certificateFile?.name || 'No file');

    const response = await API.post('/EmpProfDetails', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data) {
      throw new Error('Invalid response format: No data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error adding/updating professional detail:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw error;
    }
  }
};

export default {
  getProfById,
  updateProfById,
  addOrUpdateProfessionalDetail
};