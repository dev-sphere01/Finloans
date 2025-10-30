const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const queryService = require("../services/queryService");

// Get all users (with pagination and filtering)
// Get all users (with pagination and filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const options = {
      searchableFields: ['username', 'email', 'firstName', 'lastName'],
      populate: [
        { path: 'roleId', select: 'name description' },
        { path: 'createdBy', select: 'username firstName lastName' },
        { path: 'updatedBy', select: 'username firstName lastName' }
      ],
      customFilters: async (filters, baseFilter) => {
        for (const key in filters) {
          if (filters[key]) {
            if (key === 'isActive') {
              if (filters[key] === 'active') {
                baseFilter[key] = true;
              } else if (filters[key] === 'inactive') {
                baseFilter[key] = false;
              } else {
                baseFilter[key] = filters[key] === 'true';
              }
            } else if (key === 'roleId_name') {
              const roles = await Role.find({ name: { $regex: filters[key], $options: 'i' } }).select('_id');
              baseFilter.roleId = { $in: roles.map(r => r._id) };
            } else if (key === 'fullName') {
              if (!baseFilter.$and) baseFilter.$and = [];
              baseFilter.$and.push({
                $or: [
                  { firstName: { $regex: filters[key], $options: 'i' } },
                  { lastName: { $regex: filters[key], $options: 'i' } }
                ]
              });
            } else {
              baseFilter[key] = { $regex: filters[key], $options: 'i' };
            }
          }
        }
        return baseFilter;
      }
    };

    const { data, pagination } = await queryService.query(User, req.query, options);

    res.json({
      users: data,
      pagination
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId', 'name description permissions')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roleId } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username ?
          'Username already exists' :
          'Email already exists'
      });
    }

    // Verify role exists and is active
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ error: 'Invalid role ID' });
    }
    if (!role.isActive) {
      return res.status(400).json({ error: 'Cannot assign inactive role' });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      roleId,
      isAutoGenPass: true, // Admin-created users need to change password
      createdBy: req.userId
    });

    await user.save();

    // Populate role information
    await user.populate('roleId', 'name description');

    // Log user creation
    await AuditLog.logAction({
      userId: req.userId,
      action: 'USER_CREATE',
      resource: 'users',
      resourceId: user._id,
      details: {
        createdUser: {
          username: user.username,
          email: user.email,
          role: user.roleId.name
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('Create user error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const isAdmin = req.userRole.hasPermission('users', 'manage');
    const isSelfUpdate = req.userId.toString() === userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Restrict what non-admin users can update about themselves
    if (isSelfUpdate && !isAdmin) {
      const allowedFields = ['firstName', 'lastName', 'email'];
      const updateFields = Object.keys(updates);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        return res.status(403).json({
          error: `You can only update: ${allowedFields.join(', ')}`
        });
      }
    }

    // Check for unique constraints
    if (updates.username || updates.email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(updates.username ? [{ username: updates.username }] : []),
          ...(updates.email ? [{ email: updates.email }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          error: existingUser.username === updates.username ?
            'Username already exists' :
            'Email already exists'
        });
      }
    }

    // Verify role if being updated
    if (updates.roleId) {
      const role = await Role.findById(updates.roleId);
      if (!role) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      if (!role.isActive) {
        return res.status(400).json({ error: 'Cannot assign inactive role' });
      }
    }

    // Update user
    const oldData = user.toObject();
    Object.assign(user, updates);
    user.updatedBy = req.userId;
    await user.save();

    // Populate role information
    await user.populate('roleId', 'name description');

    // Log user update
    await AuditLog.logAction({
      userId: req.userId,
      action: 'USER_UPDATE',
      resource: 'users',
      resourceId: user._id,
      details: {
        updatedFields: Object.keys(updates),
        oldData: {
          username: oldData.username,
          email: oldData.email,
          isActive: oldData.isActive
        },
        newData: {
          username: user.username,
          email: user.email,
          isActive: user.isActive
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user (soft delete - deactivate)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (req.userId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    user.updatedBy = req.userId;
    await user.save();

    // Log user deletion
    await AuditLog.logAction({
      userId: req.userId,
      action: 'USER_DELETE',
      resource: 'users',
      resourceId: user._id,
      details: {
        deletedUser: {
          username: user.username,
          email: user.email
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'User deactivated successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Unlock user account
exports.unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isLocked) {
      return res.status(400).json({ error: 'Account is not locked' });
    }

    // Reset login attempts and unlock
    await user.resetLoginAttempts();

    // Log account unlock
    await AuditLog.logAction({
      userId: req.userId,
      action: 'ACCOUNT_UNLOCK',
      resource: 'users',
      resourceId: user._id,
      details: {
        unlockedUser: {
          username: user.username,
          email: user.email
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'Account unlocked successfully' });

  } catch (error) {
    console.error('Unlock account error:', error);
    res.status(500).json({ error: 'Failed to unlock account' });
  }
};

// Get current user profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('roleId', 'name description permissions');

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Get user profile (for user routes)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('roleId', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.roleId;
    delete updateData.isActive;
    delete updateData.loginAttempts;
    delete updateData.lockUntil;

    // Handle password change separately if provided
    if (req.body.currentPassword && req.body.newPassword) {
      const user = await User.findById(userId);

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(req.body.currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      updateData.password = req.body.newPassword;
      updateData.isAutoGenPass = false;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('roleId', 'name description').select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log profile update
    await AuditLog.logAction({
      userId: userId,
      action: 'USER_PROFILE_UPDATE',
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);

    await AuditLog.logAction({
      userId: req.user._id,
      action: 'USER_PROFILE_UPDATE',
      details: { error: error.message },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Profile update failed'
    });

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
      message: 'Failed to update profile'
    });
  }
};

// Get user applications
exports.getUserApplications = async (req, res) => {
  try {
    const Application = require('../models/Application');

    console.log('getUserApplications called for user:', req.user._id);
    console.log('User data:', req.user);

    // Find applications by applicantId (direct user link)
    let applications = await Application.find({ applicantId: req.user._id })
      .sort({ submittedAt: -1 })
      .limit(50) // Limit to last 50 applications
      .populate('applicantId', 'firstName lastName email');

    console.log('Found applications by applicantId:', applications.length);

    // If no applications found by applicantId, try to find by user data (for legacy applications)
    if (applications.length === 0) {
      console.log('No applications found by applicantId, trying legacy search...');
      const legacyQuery = {};
      const orConditions = [];

      if (req.user.panNumber) {
        orConditions.push({ panNumber: req.user.panNumber });
      }
      if (req.user.phone) {
        orConditions.push({ mobileNumber: req.user.phone });
      }
      if (req.user.email) {
        orConditions.push({ fullName: { $regex: `${req.user.firstName}.*${req.user.lastName}`, $options: 'i' } });
      }

      if (orConditions.length > 0) {
        legacyQuery.$or = orConditions;
        applications = await Application.find(legacyQuery)
          .sort({ submittedAt: -1 })
          .limit(50);
        console.log('Found legacy applications:', applications.length);
      }
    }

    console.log('Total applications found:', applications.length);
    console.log('Applications data:', applications);

    res.json({
      success: true,
      data: applications || []
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};
