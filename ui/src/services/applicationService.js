import API from './API';

const applicationService = {
  // Submit a new application
  submitApplication: async (applicationData) => {
    try {
      const response = await API.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplication: async (applicationId) => {
    try {
      const response = await API.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Get applications with filters (admin only)
  getApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/applications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Update application status (admin only)
  updateApplicationStatus: async (applicationId, status, note = '') => {
    try {
      const response = await API.put(`/applications/${applicationId}/status`, {
        status,
        note
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Add note to application (admin only)
  addNote: async (applicationId, note) => {
    try {
      const response = await API.post(`/applications/${applicationId}/notes`, {
        note
      });
      return response.data;
    } catch (error) {
      console.error('Error adding note to application:', error);
      throw error;
    }
  },

  // Get application statistics (admin only)
  getApplicationStats: async () => {
    try {
      const response = await API.get('/applications/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  }
};

export default applicationService;