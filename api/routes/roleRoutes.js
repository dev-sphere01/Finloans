const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  addPermissionToRole,
  removePermissionFromRole,
  getAvailablePermissions,
  getRoleTemplates
} = require('../controllers/roleController');
const {
  authenticateToken,
  authorize,
  logAccess
} = require('../middlewares/auth');
const {
  validateRoleCreation,
  validateRoleUpdate,
  validateMongoId,
  validatePagination
} = require('../middlewares/validation');

router.get('/', authenticateToken, authorize('roles', 'read'), validatePagination, logAccess('ROLE_LIST', 'roles'), getAllRoles);
router.get('/permissions/available', authenticateToken, authorize('roles', 'read'), getAvailablePermissions);
router.get('/templates', authenticateToken, authorize('roles', 'read'), getRoleTemplates);
router.get('/:id', authenticateToken, authorize('roles', 'read'), validateMongoId('id'), logAccess('ROLE_VIEW', 'roles'), getRoleById);
router.post('/', authenticateToken, authorize('roles', 'create'), validateRoleCreation, logAccess('ROLE_CREATE', 'roles'), createRole);
router.put('/:id', authenticateToken, authorize('roles', 'update'), validateMongoId('id'), validateRoleUpdate, logAccess('ROLE_UPDATE', 'roles'), updateRole);
router.delete('/:id', authenticateToken, authorize('roles', 'delete'), validateMongoId('id'), logAccess('ROLE_DELETE', 'roles'), deleteRole);
router.post('/:id/permissions', authenticateToken, authorize('roles', 'update'), validateMongoId('id'), logAccess('PERMISSION_GRANT', 'roles'), addPermissionToRole);
router.delete('/:id/permissions', authenticateToken, authorize('roles', 'update'), validateMongoId('id'), logAccess('PERMISSION_REVOKE', 'roles'), removePermissionFromRole);

module.exports = router;
