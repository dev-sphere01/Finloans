import API from './API';

const userService = {
  // Fetch all users with pagination and filters
  getUsers: async (params) => {
    try {
      const response = await API.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || { error: 'Failed to fetch users' };
    }
  },

  // Fetch a single user by ID
  getUserById: async (id) => {
    try {
      const response = await API.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await API.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error.response?.data || { error: 'Failed to create user' };
    }
  },

  // Update an existing user
  updateUser: async (id, userData) => {
    try {
      const response = await API.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error.response?.data || { error: 'Failed to update user' };
    }
  },

  // Delete a user (soft delete)
  deleteUser: async (id) => {
    try {
      const response = await API.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error.response?.data || { error: 'Failed to delete user' };
    }
  },

  // Unlock a user account
  unlockUser: async (id) => {
    try {
      const response = await API.post(`/users/${id}/unlock`);
      return response.data;
    } catch (error) {
      console.error(`Error unlocking user ${id}:`, error);
      throw error.response?.data || { error: 'Failed to unlock user' };
    }
  },
};

export default userService;
