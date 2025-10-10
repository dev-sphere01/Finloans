import API from './API';

const userService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Public user registration (automatically assigns "user" role)
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await API.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Get user applications
  getUserApplications: async () => {
    try {
      const response = await API.get('/users/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  },

  // Admin user management functions
  // Get all users (admin only)
  getUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/users/admin/list?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await API.get(`/users/admin/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create user (admin only) - requires username, email, password, firstName, lastName, roleId
  createUser: async (userData) => {
    try {
      const response = await API.post('/users/admin', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await API.put(`/users/admin/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await API.delete(`/users/admin/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Unlock user account (admin only)
  unlockUser: async (userId) => {
    try {
      const response = await API.post(`/users/admin/${userId}/unlock`);
      return response.data;
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw error;
    }
  }
};

export default userService;