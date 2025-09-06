import API from '@/services/API';

/**
 * Upload attendance file (no front-end validation/processing)
 * Backend endpoint: POST /Attendances/ImportAttendance (expects IFormFile named "file")
 *
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<Object>} - The API response data
 */
export const uploadAttendanceExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/Attendances/ImportAttendance', formData);
  return response.data;
};

export default {
  uploadAttendanceExcel,
};

// *** This service is not beign used at the moment. ***