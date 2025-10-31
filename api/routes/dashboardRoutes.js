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
 * @route   GET /api/dashboard/users
 * @desc    Get user statistics
 * @access  Private (requires authentication and user permissions)
 */
router.get('/users', 
  auth.authenticateToken,
  dashboardController.getUserStats
);

/**
 * @route   GET /api/dashboard/applications
 * @desc    Get application statistics
 * @access  Private (requires authentication and application permissions)
 */
router.get('/applications', 
  auth.authenticateToken,
  dashboardController.getApplicationStats
);

/**
 * @route   GET /api/dashboard/leads
 * @desc    Get lead statistics
 * @access  Private (requires authentication and lead permissions)
 */
router.get('/leads', 
  auth.authenticateToken,
  dashboardController.getLeadStats
);

/**
 * @route   GET /api/dashboard/audit
 * @desc    Get audit statistics
 * @access  Private (requires authentication and audit permissions)
 */
router.get('/audit', 
  auth.authenticateToken,
  dashboardController.getAuditStats
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