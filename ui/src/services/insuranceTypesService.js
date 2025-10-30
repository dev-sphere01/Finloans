import API from './API';

const insuranceTypesService = {
  // Get all insurance types with subtypes
  getInsuranceTypes: async (params = {}) => {
    try {
      const response = await API.get('/insurances', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching insurance types:', error);
      throw error.response?.data || { error: 'Failed to fetch insurance types' };
    }
  },

  // Get subtypes for a specific insurance type
  getSubTypes: async (insuranceType) => {
    try {
      const response = await API.get(`/insurances/type/${encodeURIComponent(insuranceType)}/subtypes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtypes for ${insuranceType}:`, error);
      throw error.response?.data || { error: 'Failed to fetch subtypes' };
    }
  },

  // Validate insurance type and subtype combination
  validateTypeSubType: async (insuranceType, subType) => {
    try {
      const response = await API.get('/insurances/validate/type-subtype', {
        params: { insuranceType, subType }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating insurance type/subtype:', error);
      throw error.response?.data || { error: 'Failed to validate insurance type/subtype' };
    }
  },

  // Create new insurance type (admin only)
  createInsuranceType: async (insuranceData) => {
    try {
      const response = await API.post('/insurances', insuranceData);
      return response.data;
    } catch (error) {
      console.error('Error creating insurance type:', error);
      throw error.response?.data || { error: 'Failed to create insurance type' };
    }
  },

  // Update insurance type (admin only)
  updateInsuranceType: async (id, insuranceData) => {
    try {
      const response = await API.put(`/insurances/${id}`, insuranceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating insurance type ${id}:`, error);
      throw error.response?.data || { error: 'Failed to update insurance type' };
    }
  },

  // Delete insurance type (admin only)
  deleteInsuranceType: async (id) => {
    try {
      const response = await API.delete(`/insurances/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting insurance type ${id}:`, error);
      throw error.response?.data || { error: 'Failed to delete insurance type' };
    }
  }
};

export default insuranceTypesService;