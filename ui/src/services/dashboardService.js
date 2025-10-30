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
  }
};

export default dashboardService;