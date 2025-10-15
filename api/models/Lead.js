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
  callHistory: [{
    callTime: {
      type: Date,
      default: Date.now
    },
    callEndTime: {
      type: Date
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    picked: {
      type: Boolean
    },
    outcome: {
      type: String
      // No enum restriction - can be any status
    },
    notes: {
      type: String,
      trim: true
    },
    calledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
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

// Method to start call session - automatically sets status to 'called'
leadSchema.methods.startCall = async function(userId) {
  console.log('startCall method called for lead:', this._id, 'by user:', userId);
  console.log('Current callHistory before:', this.callHistory);
  
  const callStartTime = new Date();
  this.lastCallAt = callStartTime;
  this.callAttempts = (this.callAttempts || 0) + 1;
  
  // Initialize callHistory if it doesn't exist
  if (!this.callHistory) {
    this.callHistory = [];
    console.log('Initialized empty callHistory array');
  }
  
  // Add new call entry to history
  const newCallEntry = {
    callTime: callStartTime,
    calledBy: userId
  };
  
  this.callHistory.push(newCallEntry);
  console.log('Added call entry to history:', newCallEntry);
  console.log('Total call history entries after push:', this.callHistory.length);
  console.log('Full callHistory array:', this.callHistory);
  
  // Auto-set status to 'called' when call is initiated (no restrictions)
  this.status = 'called';
  console.log('Auto-set status to "called" when call started');
  
  this.updatedBy = userId;
  
  // Mark the callHistory field as modified to ensure it saves
  this.markModified('callHistory');
  
  console.log('Saving lead with call history...');
  try {
    const savedLead = await this.save();
    console.log('Lead saved successfully. CallHistory length:', savedLead.callHistory.length);
    return savedLead;
  } catch (error) {
    console.error('Error saving lead:', error);
    throw error;
  }
};

// Available Lead Statuses (no hierarchy - flexible transitions)
leadSchema.statics.AVAILABLE_STATUSES = [
  'unassigned',    // Initial state - lead not assigned to anyone
  'assigned',      // Lead assigned to staff member
  'called',        // Call attempted (auto-set when call starts)
  'not_picked',    // Call not picked up / not connected
  'picked',        // Call picked up, conversation happened
  'interested',    // Customer showed interest
  'in_progress',   // Work in progress / actively working on lead
  'applied',       // Customer applied for service
  'completed',     // Deal closed successfully
  'failed',        // Failed to convert / not interested
  'follow_up'      // Requires follow-up call
];

// Method to validate status (no restrictions - any string allowed)
leadSchema.methods.canTransitionTo = function(newStatus) {
  return true; // Allow any status
};

// Method to get status description
leadSchema.statics.getStatusDescription = function(status) {
  const descriptions = {
    unassigned: 'Lead not assigned to any staff member',
    assigned: 'Lead assigned to staff member, awaiting contact',
    called: 'Call attempted, waiting for outcome',
    not_picked: 'Call not answered or not connected',
    picked: 'Call answered, conversation in progress',
    interested: 'Customer showed interest in service',
    in_progress: 'Work in progress, actively working on lead',
    applied: 'Customer applied for the service',
    completed: 'Deal closed successfully',
    failed: 'Failed to convert or customer not interested',
    follow_up: 'Requires follow-up call or action'
  };
  return descriptions[status] || 'Unknown status';
};

// Method to get all available statuses (no restrictions)
leadSchema.methods.getNextPossibleStatuses = function() {
  return leadSchema.statics.AVAILABLE_STATUSES.map(status => ({
    value: status,
    label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
    description: leadSchema.statics.getStatusDescription(status)
  }));
};

// Method to get call statistics
leadSchema.methods.getCallStats = function() {
  console.log('getCallStats called, callHistory:', this.callHistory);
  
  const callHistoryArray = this.callHistory || [];
  const totalCalls = callHistoryArray.length;
  const pickedCalls = callHistoryArray.filter(call => call.picked === true).length;
  const notPickedCalls = callHistoryArray.filter(call => call.picked === false).length;
  const totalDuration = callHistoryArray.reduce((sum, call) => sum + (call.duration || 0), 0);
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
  
  const stats = {
    totalCalls,
    pickedCalls,
    notPickedCalls,
    totalDuration, // in seconds
    avgDuration, // in seconds
    lastCallTime: this.lastCallAt,
    callHistory: callHistoryArray.map(call => ({
      callTime: call.callTime,
      callEndTime: call.callEndTime,
      duration: call.duration,
      picked: call.picked,
      outcome: call.outcome,
      notes: call.notes,
      calledBy: call.calledBy
    }))
  };
  
  console.log('Returning call stats:', stats);
  return stats;
};

// Pre-save middleware for status validation (just check if valid status - no transition restrictions)
leadSchema.pre('save', function(next) {
  // Only check if status is in the valid list, no transition restrictions
  if (this.isModified('status')) {
    if (!leadSchema.statics.AVAILABLE_STATUSES.includes(this.status)) {
      const error = new Error(`Invalid status: '${this.status}'. Must be one of: ${leadSchema.statics.AVAILABLE_STATUSES.join(', ')}`);
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Method to end call session with status validation
leadSchema.methods.endCall = function(callData, userId) {
  console.log('Lead.endCall called with:', { callData, userId, currentStatus: this.status });
  
  try {
    const callEndTime = new Date();
    
    // Update the latest call entry in history
    if (this.callHistory.length > 0) {
      const latestCall = this.callHistory[this.callHistory.length - 1];
      latestCall.callEndTime = callEndTime;
      
      // Calculate call duration in seconds
      if (latestCall.callTime) {
        latestCall.duration = Math.floor((callEndTime - latestCall.callTime) / 1000);
      }
      
      // Set call outcome
      if (callData.callPicked !== undefined) {
        latestCall.picked = callData.callPicked;
        this.callPicked = callData.callPicked; // Keep for backward compatibility
      }
      
      // Set call notes
      if (callData.remarks) {
        latestCall.notes = callData.remarks;
      }
    }
    
    if (callData.selectedService) {
      this.selectedService = callData.selectedService;
    }
    
    if (callData.serviceSubcategory) {
      this.serviceSubcategory = callData.serviceSubcategory;
    }
    
    if (callData.serviceProvider) {
      this.serviceProvider = callData.serviceProvider === '' ? null : callData.serviceProvider;
    }
    
    if (callData.remarks) {
      this.remarks = callData.remarks;
    }
    
    // Handle status update (no restrictions)
    let finalStatus = callData.status;
    
    // Auto-determine status based on call outcome if not explicitly set
    if (!finalStatus) {
      if (callData.callPicked === false) {
        finalStatus = 'not_picked';
      } else if (callData.callPicked === true) {
        finalStatus = 'picked';
      }
    }
    
    if (finalStatus && finalStatus !== this.status) {
      console.log(`Updating status: ${this.status} -> ${finalStatus}`);
      
      // Just check if it's a valid status (no transition restrictions)
      if (leadSchema.statics.AVAILABLE_STATUSES.includes(finalStatus)) {
        this.status = finalStatus;
        
        // Update call outcome in history
        if (this.callHistory.length > 0) {
          this.callHistory[this.callHistory.length - 1].outcome = finalStatus;
        }
        
        console.log('Status updated successfully');
      } else {
        const error = new Error(`Invalid status: '${finalStatus}'. Must be one of: ${leadSchema.statics.AVAILABLE_STATUSES.join(', ')}`);
        console.error('Status update failed:', error.message);
        throw error;
      }
    }
    
    this.updatedBy = userId;
    console.log('Saving lead with final status:', this.status);
    return this.save();
    
  } catch (error) {
    console.error('Error in Lead.endCall:', error);
    throw error;
  }
};

module.exports = mongoose.model('Lead', leadSchema);