const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[6-9][0-9]{9}$/, 'Invalid contact number format']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  selectedService: {
    type: String,
    required: [true, 'Service selection is required'],
    trim: true
  },
  serviceSubcategory: {
    type: String,
    trim: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'pending', 'completed', 'failed'],
    default: 'unassigned'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastCallAt: {
    type: Date
  },
  callAttempts: {
    type: Number,
    default: 0
  },
  callPicked: {
    type: Boolean
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  callNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Call notes cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['manual', 'bulk_import', 'web_form', 'api'],
    default: 'manual'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ selectedService: 1 });
leadSchema.index({ contactNo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ assignedAt: -1 });
leadSchema.index({ lastCallAt: -1 });

// Compound indexes
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

// Virtual for assigned staff name
leadSchema.virtual('assignedToName', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstName lastName' }
});

// Pre-save middleware to update assignedAt when assignedTo changes
leadSchema.pre('save', function(next) {
  if (this.isModified('assignedTo') && this.assignedTo) {
    this.assignedAt = new Date();
    if (this.status === 'unassigned') {
      this.status = 'assigned';
    }
  }
  next();
});

// Method to assign lead to staff
leadSchema.methods.assignToStaff = function(staffId, assignedBy) {
  this.assignedTo = staffId;
  this.assignedBy = assignedBy;
  this.assignedAt = new Date();
  this.status = 'assigned';
  this.updatedBy = assignedBy;
  return this.save();
};

// Method to start call session
leadSchema.methods.startCall = function(userId) {
  this.lastCallAt = new Date();
  this.callAttempts = (this.callAttempts || 0) + 1;
  this.updatedBy = userId;
  return this.save();
};

// Method to end call session
leadSchema.methods.endCall = function(callData, userId) {
  if (callData.callPicked !== undefined) {
    this.callPicked = callData.callPicked;
  }
  
  if (callData.selectedService) {
    this.selectedService = callData.selectedService;
  }
  
  if (callData.serviceSubcategory) {
    this.serviceSubcategory = callData.serviceSubcategory;
  }
  
  if (callData.serviceProvider) {
    this.serviceProvider = callData.serviceProvider;
  }
  
  if (callData.status) {
    this.status = callData.status;
  }
  
  if (callData.remarks) {
    this.remarks = callData.remarks;
  }
  
  if (callData.callNotes) {
    this.callNotes = callData.callNotes;
  }
  
  // If call wasn't picked, keep status as pending
  if (this.callPicked === false && this.status !== 'failed') {
    this.status = 'pending';
  }
  
  this.updatedBy = userId;
  return this.save();
};

module.exports = mongoose.model('Lead', leadSchema);