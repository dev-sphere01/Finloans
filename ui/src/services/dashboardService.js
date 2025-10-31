import API from './API';

const dashboardService = {
  // Get role-based dashboard data from server
  getDashboardData: async () => {
    try {
      const response = await API.get('/dashboard/data');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get quick stats for dashboard header
  getQuickStats: async () => {
    try {
      const response = await API.get('/dashboard/quick-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  },

  // Get user statistics separately
  getUserStats: async () => {
    try {
      const response = await API.get('/dashboard/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get application statistics separately
  getApplicationStats: async () => {
    try {
      const response = await API.get('/dashboard/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },

  // Get lead statistics separately
  getLeadStats: async () => {
    try {
      const response = await API.get('/dashboard/leads');
      return response.data;
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      throw error;
    }
  },

  // Get audit statistics separately
  getAuditStats: async () => {
    try {
      const response = await API.get('/dashboard/audit');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }
};

export default dashboardService;