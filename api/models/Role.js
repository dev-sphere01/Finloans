const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true
  },
  actions: [{
    type: String,
    required: true
  }]
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [permissionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false // System roles cannot be deleted
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
roleSchema.index({ isActive: 1 });

// Method to check if role has permission
roleSchema.methods.hasPermission = function (resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;

  return permission.actions.includes(action) || permission.actions.includes('manage');
};

// Method to add permission
roleSchema.methods.addPermission = function (resource, actions) {
  const existingPermission = this.permissions.find(p => p.resource === resource);

  if (existingPermission) {
    // Merge actions, avoiding duplicates
    const newActions = [...new Set([...existingPermission.actions, ...actions])];
    existingPermission.actions = newActions;
  } else {
    this.permissions.push({ resource, actions });
  }

  return this.save();
};

// Method to remove permission
roleSchema.methods.removePermission = function (resource, actions = null) {
  if (actions === null) {
    // Remove entire resource permission
    this.permissions = this.permissions.filter(p => p.resource !== resource);
  } else {
    // Remove specific actions
    const permission = this.permissions.find(p => p.resource === resource);
    if (permission) {
      permission.actions = permission.actions.filter(a => !actions.includes(a));
      if (permission.actions.length === 0) {
        this.permissions = this.permissions.filter(p => p.resource !== resource);
      }
    }
  }

  return this.save();
};

module.exports = mongoose.model('Role', roleSchema);