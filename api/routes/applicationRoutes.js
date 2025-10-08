const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const applicationValidation = require('../middlewares/applicationValidation');
const auth = require('../middlewares/auth');

// Public routes (no authentication required)

/**
 * @route   POST /api/applications
 * @desc    Submit a new application
 * @access  Public
 */
router.post('/', 
  applicationValidation.validateApplication(),
  applicationController.submitApplication
);

/**
 * @route   GET /api/applications/:applicationId
 * @desc    Get application by ID
 * @access  Public (users can check their own application status)
 */
router.get('/:applicationId', applicationController.getApplication);

/**
 * @route   GET /api/applications/test
 * @desc    Test endpoint to verify server is working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Applications API is working',
    timestamp: new Date().toISOString()
  });
});

// Protected routes (authentication required)

/**
 * @route   GET /api/applications/admin/list
 * @desc    Get all applications with filters and pagination
 * @access  Private (Admin only)
 */
router.get('/admin/list', 
  // Temporarily remove auth for testing - TODO: Re-enable auth
  // auth.authenticateToken,
  // auth.requireAdmin,
  applicationController.getApplications
);

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Update application status
 * @access  Private (Admin only)
 */
router.put('/:applicationId/status',
  auth.authenticateToken,
  auth.requireAdmin,
  [
    require('express-validator').body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['pending', 'under-review', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
    require('express-validator').body('note')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Note cannot exceed 1000 characters')
  ],
  applicationController.updateApplicationStatus
);

/**
 * @route   POST /api/applications/:applicationId/notes
 * @desc    Add note to application
 * @access  Private (Admin only)
 */
router.post('/:applicationId/notes',
  auth.authenticateToken,
  auth.requireAdmin,
  [
    require('express-validator').body('note')
      .trim()
      .notEmpty()
      .withMessage('Note content is required')
      .isLength({ min: 5, max: 1000 })
      .withMessage('Note must be between 5 and 1000 characters')
  ],
  applicationController.addNote
);

/**
 * @route   GET /api/applications/admin/stats
 * @desc    Get application statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats',
  auth.authenticateToken,
  auth.requireAdmin,
  applicationController.getApplicationStats
);

module.exports = router;