const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  unlockUser,
  getCurrentUserProfile
} = require('../controllers/userController');
const {
  authenticateToken,
  authorize,
  requireAdmin,
  canModifyUser,
  logAccess
} = require('../middlewares/auth');
const {
  validateUserRegistration,
  validateUserUpdate,
  validateMongoId,
  validatePagination
} = require('../middlewares/validation');

router.get('/', authenticateToken, authorize('users', 'read'), validatePagination, logAccess('USER_LIST', 'users'), getAllUsers);
router.get('/profile/me', authenticateToken, getCurrentUserProfile);
router.get('/:id', authenticateToken, authorize('users', 'read'), validateMongoId('id'), logAccess('USER_VIEW', 'users'), getUserById);
router.post('/', authenticateToken, authorize('users', 'create'), validateUserRegistration, logAccess('USER_CREATE', 'users'), createUser);
router.put('/:id', authenticateToken, canModifyUser, validateMongoId('id'), validateUserUpdate, logAccess('USER_UPDATE', 'users'), updateUser);
router.delete('/:id', authenticateToken, authorize('users', 'delete'), validateMongoId('id'), logAccess('USER_DELETE', 'users'), deleteUser);
router.post('/:id/unlock', authenticateToken, requireAdmin, validateMongoId('id'), logAccess('ACCOUNT_UNLOCK', 'users'), unlockUser);

module.exports = router;
