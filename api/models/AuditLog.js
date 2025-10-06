const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'LOGOUT', 
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_LIST',
      'ROLE_CREATE',
      'ROLE_UPDATE',
      'ROLE_DELETE',
      'ROLE_LIST',
      'PERMISSION_GRANT',
      'PERMISSION_REVOKE',
      'ACCOUNT_LOCK',
      'ACCOUNT_UNLOCK',
      'FAILED_LOGIN',
      'APPLICATION_CREATE',
      'APPLICATION_UPDATE',
      'APPLICATION_DELETE',
      'APPLICATION_LIST',
      'APPLICATION_VIEW',
      'APPLICATION_STATUS_UPDATE',
      'APPLICATION_NOTE_ADD',
      'UNAUTHORIZED_ACCESS'
    ]
  },
  resource: {
    type: String,
    default: null // e.g., 'users', 'roles', 'auth'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // ID of the affected resource
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null // Additional details about the action
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.logAction = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent breaking the main operation
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);