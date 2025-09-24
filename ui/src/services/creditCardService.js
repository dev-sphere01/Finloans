import API from './API';

const creditCardService = {
  // Fetch all credit cards with pagination and filters
  getCreditCards: async (params) => {
    try {
      const response = await API.get('/credit-cards', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      throw error.response?.data || { error: 'Failed to fetch credit cards' };
    }
  },

  // Fetch a single credit card by ID
  getCreditCardById: async (id) => {
    try {
      const response = await API.get(`/credit-cards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching credit card ${id}:`, error);
      throw error.response?.data || { error: 'Failed to fetch credit card' };
    }
  },

  // Create a new credit card
  createCreditCard: async (creditCardData) => {
    try {
      const formData = new FormData();
      for (const key in creditCardData) {
        formData.append(key, creditCardData[key]);
      }
      const response = await API.post('/credit-cards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating credit card:', error);
      throw error.response?.data || { error: 'Failed to create credit card' };
    }
  },

  // Update an existing credit card
  updateCreditCard: async (id, creditCardData) => {
    try {
      const formData = new FormData();
      for (const key in creditCardData) {
        formData.append(key, creditCardData[key]);
      }
      const response = await API.put(`/credit-cards/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating credit card ${id}:`, error);
      throw error.response?.data || { error: 'Failed to update credit card' };
    }
  },

  // Delete a credit card
  deleteCreditCard: async (id) => {
    try {
      const response = await API.delete(`/credit-cards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting credit card ${id}:`, error);
      throw error.response?.data || { error: 'Failed to delete credit card' };
    }
  },
};

export default creditCardService;