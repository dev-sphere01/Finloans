const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Application metadata
  applicationId: {
    type: String,
    unique: true,
    required: false // Will be auto-generated in pre-save middleware
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['credit-card', 'insurance', 'loan']
  },
  subType: {
    type: String,
    required: function() {
      return this.serviceType === 'insurance' || this.serviceType === 'loan';
    }
    // Removed hardcoded enum - will be validated dynamically against masters
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'under-review', 'approved', 'rejected', 'cancelled']
  },
  
  // Basic Information (required for all applications)
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  panNumber: {
    type: String,
    required: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^[6-9][0-9]{9}$/, 'Invalid mobile number format']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  aadhaarNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{12}$/, 'Invalid Aadhaar format']
  },
  currentAddress: {
    type: String,
    required: true,
    trim: true
  },

  // Employment & Income Details (for credit cards and loans)
  monthlyIncome: {
    type: Number,
    required: function() {
      return this.serviceType === 'credit-card' || this.serviceType === 'loan';
    }
  },
  employmentType: {
    type: String,
    required: function() {
      return this.serviceType === 'credit-card';
    },
    enum: ['salaried', 'self-employed', 'business', 'freelancer']
  },
  companyName: {
    type: String,
    required: function() {
      return this.serviceType === 'credit-card';
    },
    trim: true
  },
  workExperience: {
    type: Number,
    required: false
  },

  // Credit Card specific data
  selectedCard: {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard' },
    name: String,
    bank: String,
    limit: String,
    approval: String
  },
  creditScore: {
    type: Number,
    required: false // Made optional since it might not always be available
  },
  preApproved: {
    type: Boolean,
    default: false
  },

  // Insurance specific data
  coverageAmount: {
    type: Number,
    required: function() {
      return this.serviceType === 'insurance';
    }
  },
  nomineeDetails: {
    type: String,
    required: function() {
      return this.serviceType === 'insurance';
    },
    trim: true
  },
  medicalHistory: {
    type: String,
    trim: true
  },

  // Vehicle insurance specific
  vehicleNumber: {
    type: String,
    required: function() {
      return this.serviceType === 'insurance' && this.subType === 'vehicle';
    },
    trim: true
  },
  vehicleModel: {
    type: String,
    required: function() {
      return this.serviceType === 'insurance' && this.subType === 'vehicle';
    },
    trim: true
  },
  vehicleYear: {
    type: Number,
    required: function() {
      return this.serviceType === 'insurance' && this.subType === 'vehicle';
    }
  },

  // Property insurance specific
  propertyType: {
    type: String,
    required: function() {
      return this.serviceType === 'insurance' && this.subType === 'property';
    },
    enum: ['residential', 'commercial', 'industrial']
  },
  propertyValue: {
    type: Number,
    required: function() {
      return this.serviceType === 'insurance' && this.subType === 'property';
    }
  },

  // Loan specific data
  loanAmount: {
    type: Number,
    required: function() {
      return this.serviceType === 'loan';
    }
  },
  loanPurpose: {
    type: String,
    required: function() {
      return this.serviceType === 'loan';
    },
    trim: true
  },
  collateral: {
    type: String,
    trim: true
  },

  // Business loan specific
  businessType: {
    type: String,
    required: function() {
      return this.serviceType === 'loan' && this.subType === 'business';
    },
    trim: true
  },
  businessAge: {
    type: Number,
    required: function() {
      return this.serviceType === 'loan' && this.subType === 'business';
    }
  },
  annualTurnover: {
    type: Number,
    required: function() {
      return this.serviceType === 'loan' && this.subType === 'business';
    }
  },

  // Application tracking
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documents (if any uploaded later)
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ serviceType: 1, status: 1 });
applicationSchema.index({ panNumber: 1 });
applicationSchema.index({ mobileNumber: 1 });
applicationSchema.index({ submittedAt: -1 });

// Pre-save middleware to generate application ID
applicationSchema.pre('save', async function(next) {
  if (!this.applicationId) {
    const prefix = this.serviceType.toUpperCase().replace('-', '');
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.applicationId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Virtual for age calculation
applicationSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to add notes
applicationSchema.methods.addNote = function(note, userId) {
  this.notes.push({
    note: note,
    addedBy: userId
  });
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(status, userId) {
  this.status = status;
  if (status === 'under-review' || status === 'approved' || status === 'rejected') {
    this.reviewedAt = new Date();
    this.reviewedBy = userId;
  }
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);