import API from './API';

const loanService = {
  // Fetch all loans with pagination and filters
  getLoans: async (params) => {
    try {
      const response = await API.get('/loans', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error.response?.data || { error: 'Failed to fetch loans' };
    }
  },

  // Fetch a single loan by ID
  getLoanById: async (id) => {
    try {
      const response = await API.get(`/loans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan ${id}:`, error);
      throw error.response?.data || { error: 'Failed to fetch loan' };
    }
  },

  // Create a new loan
  createLoan: async (loanData) => {
    try {
      const response = await API.post('/loans', loanData);
      return response.data;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error.response?.data || { error: 'Failed to create loan' };
    }
  },

  // Update an existing loan
  updateLoan: async (id, loanData) => {
    try {
      const response = await API.put(`/loans/${id}`, loanData);
      return response.data;
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error.response?.data || { error: 'Failed to update loan' };
    }
  },

  // Delete a loan
  deleteLoan: async (id) => {
    try {
      const response = await API.delete(`/loans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting loan ${id}:`, error);
      throw error.response?.data || { error: 'Failed to delete loan' };
    }
  },
};

export default loanService;