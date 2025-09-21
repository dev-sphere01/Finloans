import API from './API';

const roleService = {
  // Fetch all roles
  getAll: async (params) => {
    try {
      const response = await API.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error.response?.data || { error: 'Failed to fetch roles' };
    }
  },

  // Create a new role
  create: async (roleData) => {
    try {
      const response = await API.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error.response?.data || { error: 'Failed to create role' };
    }
  },
};

export default roleService;
