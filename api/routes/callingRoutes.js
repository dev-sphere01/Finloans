const express = require('express');
const router = express.Router();
const callingController = require('../controllers/callingController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateMongoId } = require('../middlewares/validation');
const upload = require('../middlewares/upload');

// All calling routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/calling/leads
 * @desc    Get all leads with filtering and pagination
 * @access  Private
 */
router.get('/leads', callingController.getLeads);

/**
 * @route   GET /api/calling/leads/:id
 * @desc    Get lead by ID
 * @access  Private
 */
router.get('/leads/:id', validateMongoId('id'), callingController.getLeadById);

/**
 * @route   POST /api/calling/leads
 * @desc    Create new lead
 * @access  Private (Admin only)
 */
router.post('/leads', requireAdmin, callingController.createLead);

/**
 * @route   PUT /api/calling/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put('/leads/:id', validateMongoId('id'), callingController.updateLead);

/**
 * @route   DELETE /api/calling/leads/:id
 * @desc    Delete lead (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/leads/:id', requireAdmin, validateMongoId('id'), callingController.deleteLead);

/**
 * @route   POST /api/calling/leads/bulk-import
 * @desc    Bulk import leads from Excel/CSV
 * @access  Private (Admin only)
 */
router.post('/leads/bulk-import', requireAdmin, upload.single('file'), callingController.bulkImportLeads);

/**
 * @route   POST /api/calling/leads/bulk-create
 * @desc    Bulk create leads from mapped data
 * @access  Private (Admin only)
 */
router.post('/leads/bulk-create', requireAdmin, callingController.bulkCreateLeads);

/**
 * @route   POST /api/calling/leads/assign
 * @desc    Assign leads to staff
 * @access  Private (Admin only)
 */
router.post('/leads/assign', requireAdmin, callingController.assignLeads);

/**
 * @route   POST /api/calling/leads/:id/start-call
 * @desc    Start call session
 * @access  Private
 */
router.post('/leads/:id/start-call', validateMongoId('id'), callingController.startCall);

/**
 * @route   POST /api/calling/leads/:id/end-call
 * @desc    End call session
 * @access  Private
 */
router.post('/leads/:id/end-call', validateMongoId('id'), callingController.endCall);

/**
 * @route   PUT /api/calling/leads/:id/status
 * @desc    Update call status
 * @access  Private
 */
router.put('/leads/:id/status', validateMongoId('id'), callingController.updateLead);

/**
 * @route   GET /api/calling/leads/:id/status-transitions
 * @desc    Get available status transitions for a lead
 * @access  Private
 */
router.get('/leads/:id/status-transitions', validateMongoId('id'), callingController.getLeadStatusTransitions);

/**
 * @route   GET /api/calling/leads/:id/call-history
 * @desc    Get call history and statistics for a lead
 * @access  Private
 */
router.get('/leads/:id/call-history', validateMongoId('id'), callingController.getLeadCallHistory);

/**
 * @route   POST /api/calling/leads/:id/test-call-history
 * @desc    Test endpoint to add call history
 * @access  Private
 */
router.post('/leads/:id/test-call-history', validateMongoId('id'), callingController.testAddCallHistory);

/**
 * @route   GET /api/calling/services
 * @desc    Get all services
 * @access  Private
 */
router.get('/services', callingController.getServices);

/**
 * @route   GET /api/calling/services/:serviceId/subcategories
 * @desc    Get service subcategories
 * @access  Private
 */
router.get('/services/:serviceId/subcategories', validateMongoId('serviceId'), callingController.getServiceSubcategories);

/**
 * @route   GET /api/calling/service-providers
 * @desc    Get service providers
 * @access  Private
 */
router.get('/service-providers', callingController.getServiceProviders);

/**
 * @route   GET /api/calling/staff
 * @desc    Get staff members for assignment
 * @access  Private (Admin only)
 */
router.get('/staff', requireAdmin, callingController.getStaff);

/**
 * @route   GET /api/calling/my-stats
 * @desc    Get current user's calling stats
 * @access  Private
 */
router.get('/my-stats', callingController.getMyStats);

/**
 * @route   GET /api/calling/reports
 * @desc    Get calling reports and analytics
 * @access  Private (Admin only)
 */
router.get('/reports', requireAdmin, callingController.getCallReports);

module.exports = router;