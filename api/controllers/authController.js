const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const config = require('../config')

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    roleId: user.roleId._id,
    roleName: user.roleId.name,
    isAutoGenPass: user.isAutoGenPass
  };

  return jwt.sign(payload, config .JWT_SECRET, {
    expiresIn: config .JWT_EXPIRES_IN || '8h',
    issuer: 'auth-system',
    audience: 'auth-system-users'
  });
};

// Login endpoint
exports.login = async (req, res) => {
  try {
    const { UserName, Password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: UserName },
        { email: UserName }
      ]
    }).populate('roleId');

    if (!user) {
      await AuditLog.logAction({
        userId: null,
        action: 'FAILED_LOGIN',
        details: { username: UserName, reason: 'User not found' },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Invalid credentials'
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      await AuditLog.logAction({
        userId: user._id,
        action: 'FAILED_LOGIN',
        details: { username: UserName, reason: 'Account locked' },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Account locked'
      });

      return res.status(401).json({ 
        error: 'Account is locked due to multiple failed login attempts. Please try again later.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      await AuditLog.logAction({
        userId: user._id,
        action: 'FAILED_LOGIN',
        details: { username: UserName, reason: 'Account deactivated' },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Account deactivated'
      });

      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check if role is active
    if (!user.roleId || !user.roleId.isActive) {
      await AuditLog.logAction({
        userId: user._id,
        action: 'FAILED_LOGIN',
        details: { username: UserName, reason: 'Role inactive' },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Role inactive'
      });

      return res.status(401).json({ error: 'User role is inactive' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(Password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      await AuditLog.logAction({
        userId: user._id,
        action: 'FAILED_LOGIN',
        details: { 
          username: UserName, 
          reason: 'Invalid password',
          loginAttempts: user.loginAttempts + 1
        },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Invalid credentials'
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await AuditLog.logAction({
      userId: user._id,
      action: 'LOGIN',
      details: { username: UserName },
      ipAddress,
      userAgent,
      success: true
    });

    // Return response in the format expected by the frontend
    res.json({
      token,
      isAutoGenPass: user.isAutoGenPass,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        roleId: user.roleId._id,
        roleName: user.roleId.name,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    await AuditLog.logAction({
      userId: null,
      action: 'FAILED_LOGIN',
      details: { username: req.body.UserName, error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Server error during login'
    });

    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// Change password endpoint
exports.changePassword = async (req, res) => {
  try {
    const { CurrentPassword, NewPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(CurrentPassword);
    
    if (!isCurrentPasswordValid) {
      await AuditLog.logAction({
        userId: user._id,
        action: 'PASSWORD_CHANGE',
        details: { reason: 'Invalid current password' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Invalid current password'
      });

      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(NewPassword);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Update password
    user.password = NewPassword;
    user.isAutoGenPass = false; // User has set their own password
    user.updatedBy = user._id;
    await user.save();

    // Log successful password change
    await AuditLog.logAction({
      userId: user._id,
      action: 'PASSWORD_CHANGE',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ 
      message: 'Password changed successfully',
      isAutoGenPass: false
    });

  } catch (error) {
    console.error('Password change error:', error);
    
    await AuditLog.logAction({
      userId: req.user._id,
      action: 'PASSWORD_CHANGE',
      details: { error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Server error during password change'
    });

    res.status(500).json({ error: 'Failed to change password. Please try again.' });
  }
};

// Forgot password endpoint
exports.forgotPassword = async (req, res) => {
  try {
    const { UserName } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: UserName },
        { email: UserName }
      ]
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: 'If the user exists, a password reset email has been sent.' 
      });
    }

    if (!user.isActive) {
      await AuditLog.logAction({
        userId: user._id,
        action: 'PASSWORD_RESET',
        details: { username: UserName, reason: 'Account deactivated' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Account deactivated'
      });

      return res.json({ 
        message: 'If the user exists, a password reset email has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll just log it and return a temporary password
    console.log(`Password reset token for ${user.username}: ${resetToken}`);
    
    // Generate a temporary password (in production, this should be sent via email)
    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword;
    user.isAutoGenPass = true;
    await user.save();

    // Log password reset
    await AuditLog.logAction({
      userId: user._id,
      action: 'PASSWORD_RESET',
      details: { username: UserName },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // In development, return the temporary password
    // In production, this should be sent via email
    if (config.NODE_STAGE === 'development') {
      res.json({ 
        message: 'Password has been reset successfully.',
        tempPassword: tempPassword // Remove this in production
      });
    } else {
      res.json({ 
        message: 'If the user exists, a password reset email has been sent.' 
      });
    }

  } catch (error) {
    console.error('Password reset error:', error);
    
    await AuditLog.logAction({
      userId: null,
      action: 'PASSWORD_RESET',
      details: { username: req.body.UserName, error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Server error during password reset'
    });

    res.status(500).json({ error: 'Failed to process password reset. Please try again.' });
  }
};

// Logout endpoint (optional - mainly for logging)
exports.logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.logAction({
      userId: req.user._id,
      action: 'LOGOUT',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Verify token endpoint
exports.verifyToken = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:user.fullName,
        roleId: user.roleId._id,
        roleName: user.roleId.name,
        isAutoGenPass: user.isAutoGenPass,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};
