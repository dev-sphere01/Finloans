import API from './API';

const roleService = {
  // Fetch all roles
  getRoles: async (params) => {
    try {
      const response = await API.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error.response?.data || { error: 'Failed to fetch roles' };
    }
  },
};

export default roleService;
