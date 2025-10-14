const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

/**
 * @route   GET /api/dashboard/data
 * @desc    Get dashboard data based on user role and permissions
 * @access  Private (requires authentication)
 */
router.get('/data', 
  auth.authenticateToken,
  dashboardController.getDashboardData
);

/**
 * @route   GET /api/dashboard/quick-stats
 * @desc    Get quick statistics for dashboard header
 * @access  Private (requires authentication)
 */
router.get('/quick-stats', 
  auth.authenticateToken,
  dashboardController.getQuickStats
);

/**
 * @route   GET /api/dashboard/test
 * @desc    Test endpoint to verify dashboard API is working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;