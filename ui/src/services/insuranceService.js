import API from './API';

const insuranceService = {
  // Fetch all insurances with pagination and filters
  getInsurances: async (params) => {
    try {
      const response = await API.get('/insurances', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching insurances:', error);
      throw error.response?.data || { error: 'Failed to fetch insurances' };
    }
  },

  // Fetch a single insurance by ID
  getInsuranceById: async (id) => {
    try {
      const response = await API.get(`/insurances/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching insurance ${id}:`, error);
      throw error.response?.data || { error: 'Failed to fetch insurance' };
    }
  },

  // Create a new insurance
  createInsurance: async (insuranceData) => {
    try {
      const response = await API.post('/insurances', insuranceData);
      return response.data;
    } catch (error) {
      console.error('Error creating insurance:', error);
      throw error.response?.data || { error: 'Failed to create insurance' };
    }
  },

  // Update an existing insurance
  updateInsurance: async (id, insuranceData) => {
    try {
      const response = await API.put(`/insurances/${id}`, insuranceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating insurance ${id}:`, error);
      throw error.response?.data || { error: 'Failed to update insurance' };
    }
  },

  // Delete an insurance
  deleteInsurance: async (id) => {
    try {
      const response = await API.delete(`/insurances/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting insurance ${id}:`, error);
      throw error.response?.data || { error: 'Failed to delete insurance' };
    }
  },
};

export default insuranceService;