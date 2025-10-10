const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateUserUpdate, validateUserRegistration, validateMongoId } = require('../middlewares/validation');

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', validateUserUpdate, userController.updateProfile);

/**
 * @route   GET /api/users/applications
 * @desc    Get current user's applications
 * @access  Private
 */
router.get('/applications', userController.getUserApplications);

// Admin routes
/**
 * @route   GET /api/users/admin/list
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/admin/list', requireAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/admin/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/admin/:id', requireAdmin, validateMongoId('id'), userController.getUserById);

/**
 * @route   POST /api/users/admin
 * @desc    Create new user (Admin only)
 * @access  Private (Admin only)
 */
router.post('/admin', requireAdmin, validateUserRegistration, userController.createUser);

/**
 * @route   PUT /api/users/admin/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/admin/:id', requireAdmin, validateMongoId('id'), validateUserUpdate, userController.updateUser);

/**
 * @route   DELETE /api/users/admin/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/admin/:id', requireAdmin, validateMongoId('id'), userController.deleteUser);

/**
 * @route   POST /api/users/admin/:id/unlock
 * @desc    Unlock user account
 * @access  Private (Admin only)
 */
router.post('/admin/:id/unlock', requireAdmin, validateMongoId('id'), userController.unlockUser);

module.exports = router;