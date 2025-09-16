const express = require('express');
const Role = require('../models/Role');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { 
  authenticateToken, 
  authorize, 
  requireAdmin,
  logAccess 
} = require('../middlewares/auth');
const { 
  validateRoleCreation, 
  validateRoleUpdate, 
  validateMongoId,
  validatePagination 
} = require('../middlewares/validation');

const router = express.Router();

// Get all roles (with pagination and filtering)
router.get('/', 
  authenticateToken, 
  authorize('roles', 'read'),
  validatePagination,
  logAccess('ROLE_LIST', 'roles'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        isActive
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' || sortOrder === '-1' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [roles, total] = await Promise.all([
        Role.find(filter)
          .populate('createdBy', 'username firstName lastName')
          .populate('updatedBy', 'username firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Role.countDocuments(filter)
      ]);

      // Get user count for each role
      const rolesWithUserCount = await Promise.all(
        roles.map(async (role) => {
          const userCount = await User.countDocuments({ roleId: role._id, isActive: true });
          return {
            ...role.toObject(),
            userCount
          };
        })
      );

      res.json({
        roles: rolesWithUserCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }
);

// Get role by ID
router.get('/:id', 
  authenticateToken, 
  authorize('roles', 'read'),
  validateMongoId('id'),
  logAccess('ROLE_VIEW', 'roles'),
  async (req, res) => {
    try {
      const role = await Role.findById(req.params.id)
        .populate('createdBy', 'username firstName lastName')
        .populate('updatedBy', 'username firstName lastName');

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Get user count for this role
      const userCount = await User.countDocuments({ roleId: role._id, isActive: true });

      res.json({ 
        role: {
          ...role.toObject(),
          userCount
        }
      });

    } catch (error) {
      console.error('Get role error:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }
);

// Create new role
router.post('/', 
  authenticateToken, 
  authorize('roles', 'create'),
  validateRoleCreation,
  logAccess('ROLE_CREATE', 'roles'),
  async (req, res) => {
    try {
      const { name, description, permissions = [] } = req.body;

      // Check if role name already exists
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ error: 'Role name already exists' });
      }

      // Create role
      const role = new Role({
        name,
        description,
        permissions,
        createdBy: req.userId
      });

      await role.save();

      // Log role creation
      await AuditLog.logAction({
        userId: req.userId,
        action: 'ROLE_CREATE',
        resource: 'roles',
        resourceId: role._id,
        details: { 
          createdRole: {
            name: role.name,
            description: role.description,
            permissionCount: permissions.length
          }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.status(201).json({ 
        message: 'Role created successfully',
        role 
      });

    } catch (error) {
      console.error('Create role error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
      
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
);

// Update role
router.put('/:id', 
  authenticateToken, 
  authorize('roles', 'update'),
  validateMongoId('id'),
  validateRoleUpdate,
  logAccess('ROLE_UPDATE', 'roles'),
  async (req, res) => {
    try {
      const roleId = req.params.id;
      const updates = req.body;

      // Find role
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Prevent updating system roles
      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot modify system roles' });
      }

      // Check for unique name constraint
      if (updates.name) {
        const existingRole = await Role.findOne({
          _id: { $ne: roleId },
          name: updates.name
        });

        if (existingRole) {
          return res.status(400).json({ error: 'Role name already exists' });
        }
      }

      // Update role
      const oldData = role.toObject();
      Object.assign(role, updates);
      role.updatedBy = req.userId;
      await role.save();

      // Log role update
      await AuditLog.logAction({
        userId: req.userId,
        action: 'ROLE_UPDATE',
        resource: 'roles',
        resourceId: role._id,
        details: { 
          updatedFields: Object.keys(updates),
          oldData: {
            name: oldData.name,
            isActive: oldData.isActive,
            permissionCount: oldData.permissions.length
          },
          newData: {
            name: role.name,
            isActive: role.isActive,
            permissionCount: role.permissions.length
          }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.json({ 
        message: 'Role updated successfully',
        role 
      });

    } catch (error) {
      console.error('Update role error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
      
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

// Delete role (soft delete - deactivate)
router.delete('/:id', 
  authenticateToken, 
  authorize('roles', 'delete'),
  validateMongoId('id'),
  logAccess('ROLE_DELETE', 'roles'),
  async (req, res) => {
    try {
      const roleId = req.params.id;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Prevent deleting system roles
      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot delete system roles' });
      }

      // Check if role is assigned to any active users
      const userCount = await User.countDocuments({ roleId, isActive: true });
      if (userCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete role. It is assigned to ${userCount} active user(s)` 
        });
      }

      // Soft delete - deactivate role
      role.isActive = false;
      role.updatedBy = req.userId;
      await role.save();

      // Log role deletion
      await AuditLog.logAction({
        userId: req.userId,
        action: 'ROLE_DELETE',
        resource: 'roles',
        resourceId: role._id,
        details: { 
          deletedRole: {
            name: role.name,
            description: role.description
          }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.json({ message: 'Role deactivated successfully' });

    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
);

// Add permission to role
router.post('/:id/permissions', 
  authenticateToken, 
  authorize('roles', 'update'),
  validateMongoId('id'),
  logAccess('PERMISSION_GRANT', 'roles'),
  async (req, res) => {
    try {
      const { resource, actions } = req.body;

      if (!resource || !actions || !Array.isArray(actions)) {
        return res.status(400).json({ 
          error: 'Resource and actions array are required' 
        });
      }

      const validActions = ['create', 'read', 'update', 'delete', 'manage'];
      const invalidActions = actions.filter(action => !validActions.includes(action));
      
      if (invalidActions.length > 0) {
        return res.status(400).json({ 
          error: `Invalid actions: ${invalidActions.join(', ')}` 
        });
      }

      const role = await Role.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot modify system role permissions' });
      }

      await role.addPermission(resource, actions);

      // Log permission grant
      await AuditLog.logAction({
        userId: req.userId,
        action: 'PERMISSION_GRANT',
        resource: 'roles',
        resourceId: role._id,
        details: { 
          roleName: role.name,
          grantedPermission: { resource, actions }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.json({ 
        message: 'Permission added successfully',
        role 
      });

    } catch (error) {
      console.error('Add permission error:', error);
      res.status(500).json({ error: 'Failed to add permission' });
    }
  }
);

// Remove permission from role
router.delete('/:id/permissions', 
  authenticateToken, 
  authorize('roles', 'update'),
  validateMongoId('id'),
  logAccess('PERMISSION_REVOKE', 'roles'),
  async (req, res) => {
    try {
      const { resource, actions } = req.body;

      if (!resource) {
        return res.status(400).json({ error: 'Resource is required' });
      }

      const role = await Role.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (role.isSystem) {
        return res.status(400).json({ error: 'Cannot modify system role permissions' });
      }

      await role.removePermission(resource, actions);

      // Log permission revoke
      await AuditLog.logAction({
        userId: req.userId,
        action: 'PERMISSION_REVOKE',
        resource: 'roles',
        resourceId: role._id,
        details: { 
          roleName: role.name,
          revokedPermission: { resource, actions }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      res.json({ 
        message: 'Permission removed successfully',
        role 
      });

    } catch (error) {
      console.error('Remove permission error:', error);
      res.status(500).json({ error: 'Failed to remove permission' });
    }
  }
);

// Get available permissions/resources
router.get('/permissions/available', 
  authenticateToken, 
  authorize('roles', 'read'),
  async (req, res) => {
    try {
      const { SYSTEM_MODULES, CRUD_ACTIONS, MODULE_CATEGORIES } = require('../config/modules');

      res.json({ 
        modules: SYSTEM_MODULES,
        actions: CRUD_ACTIONS,
        categories: MODULE_CATEGORIES
      });

    } catch (error) {
      console.error('Get available permissions error:', error);
      res.status(500).json({ error: 'Failed to fetch available permissions' });
    }
  }
);

// Get role templates
router.get('/templates', 
  authenticateToken, 
  authorize('roles', 'read'),
  async (req, res) => {
    try {
      const { DEFAULT_ROLE_TEMPLATES } = require('../config/modules');

      res.json({ templates: DEFAULT_ROLE_TEMPLATES });

    } catch (error) {
      console.error('Get role templates error:', error);
      res.status(500).json({ error: 'Failed to fetch role templates' });
    }
  }
);

module.exports = router;