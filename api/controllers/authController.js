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
        lastLogin: user.lastLogin,
        role: {
          id: user.roleId._id,
          name: user.roleId.name,
          permissions: user.roleId.permissions
        }
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

// Public registration endpoint (automatically assigns "user" role)
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: email } // Using email as username
      ]
    });

    if (existingUser) {
      await AuditLog.logAction({
        userId: null,
        action: 'FAILED_REGISTRATION',
        details: { email, reason: 'User already exists' },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'User already exists'
      });

      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Get default user role
    const userRole = await Role.findOne({ name: 'user', isActive: true });
    if (!userRole) {
      return res.status(500).json({
        success: false,
        message: 'Default user role not found. Please contact administrator.'
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      username: email, // Using email as username
      email,
      phone,
      password, // Will be hashed by the pre-save middleware
      roleId: userRole._id,
      isActive: true,
      isAutoGenPass: false,
      createdBy: null // Self-registration
    });

    await newUser.save();

    // Populate role for token generation
    await newUser.populate('roleId');

    // Generate token
    const token = generateToken(newUser);

    // Log successful registration
    await AuditLog.logAction({
      userId: newUser._id,
      action: 'USER_REGISTER',
      details: { email, firstName, lastName },
      ipAddress,
      userAgent,
      success: true
    });

    // Return response in the same format as login
    res.status(201).json({
      token,
      isAutoGenPass: newUser.isAutoGenPass,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.fullName,
        phone: newUser.phone,
        roleId: newUser.roleId._id,
        roleName: newUser.roleId.name,
        lastLogin: null // New user, no last login yet
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    await AuditLog.logAction({
      userId: null,
      action: 'FAILED_REGISTRATION',
      details: { email: req.body.email, error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Server error during registration'
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
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
