const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).populate('roleId');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    if (user.isLocked) {
      return res.status(401).json({ error: 'Account is locked due to multiple failed login attempts' });
    }

    // Add user info to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.roleId;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check permissions
const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.userRole) {
        return res.status(403).json({ error: 'No role assigned' });
      }

      const hasPermission = req.userRole.hasPermission(resource, action);
      
      if (!hasPermission) {
        // Log unauthorized access attempt
        await AuditLog.logAction({
          userId: req.userId,
          action: 'UNAUTHORIZED_ACCESS',
          resource,
          details: { 
            attemptedAction: action,
            endpoint: req.originalUrl,
            method: req.method
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: `Insufficient permissions for ${action} on ${resource}`
        });

        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: { resource, action }
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

// Middleware to check if user is admin (has manage permission on users)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userRole) {
      return res.status(403).json({ error: 'No role assigned' });
    }

    const isAdmin = req.userRole.hasPermission('users', 'manage') || 
                   req.userRole.hasPermission('system', 'manage');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

// Middleware to check if user can modify the target user
const canModifyUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.params.userId;
    
    // Users can always modify their own data
    if (req.userId.toString() === targetUserId) {
      return next();
    }

    // Check if user has admin privileges
    const isAdmin = req.userRole.hasPermission('users', 'manage');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Cannot modify other users' });
    }

    next();
  } catch (error) {
    console.error('User modification check error:', error);
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

// Middleware to log API access
const logAccess = (action, resource = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to capture response
    res.send = function(data) {
      // Log the action
      AuditLog.logAction({
        userId: req.userId,
        action,
        resource,
        resourceId: req.params.id || req.params.userId || null,
        details: {
          endpoint: req.originalUrl,
          method: req.method,
          body: req.method !== 'GET' ? req.body : undefined
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400
      });

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  canModifyUser,
  logAccess
};