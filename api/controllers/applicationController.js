const Application = require('../models/Application');
const CreditCard = require('../models/CreditCards');
const Insurance = require('../models/Insurance');
const { validationResult } = require('express-validator');
const { uploadDocuments, handleUploadError } = require('../middlewares/fileUpload');
const path = require('path');

const applicationController = {
  // Submit a new application
  submitApplication: async (req, res) => {
    try {
      // Log incoming data for debugging
      console.log('Incoming application data:', JSON.stringify(req.body, null, 2));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const applicationData = req.body;

      // Additional validation for insurance applications
      if (applicationData.serviceType === 'insurance') {
        // If insuranceType is not provided, try to determine it from subType
        let insuranceType = applicationData.insuranceType;
        
        if (!insuranceType && applicationData.subType) {
          // Map common subtypes to their insurance types
          const subTypeToInsuranceTypeMap = {
            // Life Insurance variations
            'term': 'Life Insurance',
            'TERM': 'Life Insurance',
            'Term': 'Life Insurance',
            'whole': 'Life Insurance', 
            'WHOLE': 'Life Insurance',
            'Whole': 'Life Insurance',
            'endowment': 'Life Insurance',
            'ENDOWMENT': 'Life Insurance',
            'Endowment': 'Life Insurance',
            'life': 'Life Insurance',
            'LIFE': 'Life Insurance',
            'Life': 'Life Insurance',
            
            // Health Insurance variations
            'individual': 'Health Insurance',
            'INDIVIDUAL': 'Health Insurance',
            'Individual': 'Health Insurance',
            'family': 'Health Insurance',
            'FAMILY': 'Health Insurance',
            'Family': 'Health Insurance',
            'senior-citizen': 'Health Insurance',
            'SENIOR-CITIZEN': 'Health Insurance',
            'Senior-Citizen': 'Health Insurance',
            'critical-illness': 'Health Insurance',
            'CRITICAL-ILLNESS': 'Health Insurance',
            'Critical-Illness': 'Health Insurance',
            'health': 'Health Insurance',
            'HEALTH': 'Health Insurance',
            'Health': 'Health Insurance',
            
            // Vehicle Insurance variations
            'car': 'Vehicle Insurance',
            'CAR': 'Vehicle Insurance',
            'Car': 'Vehicle Insurance',
            'bike': 'Vehicle Insurance',
            'BIKE': 'Vehicle Insurance',
            'Bike': 'Vehicle Insurance',
            'vehicle': 'Vehicle Insurance',
            'VEHICLE': 'Vehicle Insurance',
            'Vehicle': 'Vehicle Insurance',
            'motor': 'Vehicle Insurance',
            'MOTOR': 'Vehicle Insurance',
            'Motor': 'Vehicle Insurance',
            
            // Property Insurance variations
            'home': 'Property Insurance',
            'HOME': 'Property Insurance',
            'Home': 'Property Insurance',
            'property': 'Property Insurance',
            'PROPERTY': 'Property Insurance',
            'Property': 'Property Insurance',
            'fire': 'Property Insurance',
            'FIRE': 'Property Insurance',
            'Fire': 'Property Insurance',
            
            // Travel Insurance variations
            'domestic': 'Travel Insurance',
            'DOMESTIC': 'Travel Insurance',
            'Domestic': 'Travel Insurance',
            'international': 'Travel Insurance',
            'INTERNATIONAL': 'Travel Insurance',
            'International': 'Travel Insurance',
            'travel': 'Travel Insurance',
            'TRAVEL': 'Travel Insurance',
            'Travel': 'Travel Insurance',
            
            // Commercial/Business variations
            'commercial': 'Vehicle Insurance', // Default to Vehicle, but could be Property
            'COMMERCIAL': 'Vehicle Insurance',
            'Commercial': 'Vehicle Insurance',
            'business': 'Travel Insurance', // Default to Travel, but could be others
            'BUSINESS': 'Travel Insurance',
            'Business': 'Travel Insurance'
          };
          
          insuranceType = subTypeToInsuranceTypeMap[applicationData.subType.toLowerCase()];
        }

        // Default to Life Insurance if still not determined
        if (!insuranceType) {
          insuranceType = 'Life Insurance';
        }
        const subType = applicationData.subType;

        try {
          const insurance = await Insurance.findOne({ 
            insuranceType: { $regex: new RegExp(`^${insuranceType}$`, 'i') },
            isActive: true 
          });

          if (!insurance) {
            return res.status(400).json({
              success: false,
              message: `Invalid insurance type: ${insuranceType}`
            });
          }

          let validSubType = insurance.subTypes.find(
            st => st.name.toLowerCase() === subType.toLowerCase() && st.isActive
          );

          // If exact match not found, try to find a similar one or allow any case variation
          if (!validSubType) {
            validSubType = insurance.subTypes.find(
              st => st.name.toLowerCase().includes(subType.toLowerCase()) && st.isActive
            );
          }

          // If still not found, create a flexible match for common variations
          if (!validSubType) {
            // For common cases like TERM, Term, term - all should map to 'term'
            const normalizedSubType = subType.toLowerCase();
            validSubType = insurance.subTypes.find(
              st => st.name.toLowerCase() === normalizedSubType && st.isActive
            );
            
            // If still not found, allow it but normalize to the first available subtype of this insurance type
            if (!validSubType && insurance.subTypes.length > 0) {
              console.log(`Subtype '${subType}' not found, using first available subtype for ${insuranceType}`);
              validSubType = insurance.subTypes.find(st => st.isActive);
            }
          }

          if (!validSubType) {
            const availableSubTypes = insurance.subTypes
              .filter(st => st.isActive)
              .map(st => st.name)
              .join(', ');
            return res.status(400).json({
              success: false,
              message: `Invalid insurance subtype. Available subtypes for ${insuranceType}: ${availableSubTypes}`
            });
          }

          // Normalize the subType and insuranceType to match the master data
          applicationData.subType = validSubType.name;
          applicationData.insuranceType = insurance.insuranceType;
        } catch (error) {
          console.error('Error validating insurance type:', error);
          return res.status(500).json({
            success: false,
            message: 'Error validating insurance type'
          });
        }
      }

      // Validate age (18-70)
      const birthDate = new Date(applicationData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 70) {
        return res.status(400).json({
          success: false,
          message: 'Age must be between 18 and 70 years'
        });
      }

      // Check for duplicate applications (same user + service type within 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const existingApplication = await Application.findOne({
        applicantId: req.user._id,
        panNumber: applicationData.panNumber,
        serviceType: applicationData.serviceType,
        subType: applicationData.subType || { $exists: false },
        submittedAt: { $gte: thirtyDaysAgo },
        status: { $nin: ['rejected', 'cancelled'] }
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted an application for this service recently. Please wait or contact support.',
          applicationId: existingApplication.applicationId
        });
      }

      // Add applicant ID from JWT token
      applicationData.applicantId = req.user._id;

      // Create new application
      const application = new Application(applicationData);
      await application.save();

      // Populate selected card details if it's a credit card application
      if (application.serviceType === 'credit-card' && application.selectedCard?.cardId) {
        await application.populate('selectedCard.cardId');
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          serviceType: application.serviceType,
          subType: application.subType
        }
      });

    } catch (error) {
      console.error('Error submitting application:', error);

      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting application'
      });
    }
  },

  // Get application by ID
  getApplication: async (req, res) => {
    try {
      const { applicationId } = req.params;

      const application = await Application.findOne({ applicationId })
        .populate('selectedCard.cardId')
        .populate('reviewedBy', 'firstName lastName')
        .populate('notes.addedBy', 'firstName lastName');

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });

    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching application'
      });
    }
  },

  // Get applications with filters and pagination
  getApplications: async (req, res) => {
    try {
      console.log('getApplications called with query:', req.query);

      const {
        page = 1,
        limit = 10,
        serviceType,
        subType,
        status,
        panNumber,
        mobileNumber,
        sortBy = 'submittedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      if (serviceType) filter.serviceType = serviceType;
      if (subType) filter.subType = subType;
      if (status) filter.status = status;
      if (panNumber) filter.panNumber = panNumber.toUpperCase();
      if (mobileNumber) filter.mobileNumber = mobileNumber;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [applications, total] = await Promise.all([
        Application.find(filter)
          .populate('applicantId', 'firstName lastName email phone')
          .populate('selectedCard.cardId', 'creditCardName')
          .populate('reviewedBy', 'firstName lastName')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Application.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching applications'
      });
    }
  },

  // Update application status (admin only)
  updateApplicationStatus: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, note } = req.body;
      const userId = req.user?.id; // Assuming auth middleware sets req.user

      const application = await Application.findOne({ applicationId });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Update status
      await application.updateStatus(status, userId);

      // Add note if provided
      if (note) {
        await application.addNote(note, userId);
      }

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: {
          applicationId: application.applicationId,
          status: application.status,
          reviewedAt: application.reviewedAt
        }
      });

    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating application'
      });
    }
  },

  // Add note to application (admin only)
  addNote: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { note } = req.body;
      const userId = req.user?.id;

      if (!note || note.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Note content is required'
        });
      }

      const application = await Application.findOne({ applicationId });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      await application.addNote(note.trim(), userId);

      res.json({
        success: true,
        message: 'Note added successfully'
      });

    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding note'
      });
    }
  },

  // Get application statistics (admin only)
  getApplicationStats: async (req, res) => {
    try {
      const stats = await Application.aggregate([
        {
          $group: {
            _id: {
              serviceType: '$serviceType',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.serviceType',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      // Get recent applications
      const recentApplications = await Application.find()
        .sort({ submittedAt: -1 })
        .limit(10)
        .select('applicationId serviceType subType status submittedAt fullName');

      res.json({
        success: true,
        data: {
          statistics: stats,
          recentApplications
        }
      });

    } catch (error) {
      console.error('Error fetching application stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching statistics'
      });
    }
  },

  // Upload documents for an application
  uploadDocuments: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { documentTypes } = req.body; // Array of document types corresponding to files

      // Find the application
      const application = await Application.findOne({ applicationId });
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Process uploaded files
      const uploadedDocuments = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          const documentType = documentTypes ? documentTypes[index] : file.originalname;
          uploadedDocuments.push({
            name: file.originalname,
            path: file.path,
            documentType: documentType,
            isRequired: true, // This can be determined based on loan requirements
            uploadedAt: new Date()
          });
        });

        // Add documents to application
        application.documents.push(...uploadedDocuments);
        await application.save();
      }

      res.json({
        success: true,
        message: 'Documents uploaded successfully',
        data: {
          applicationId: application.applicationId,
          uploadedDocuments: uploadedDocuments.length,
          documents: application.documents
        }
      });

    } catch (error) {
      console.error('Error uploading documents:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while uploading documents'
      });
    }
  },

  // Get loan requirements for document upload
  getLoanRequirements: async (req, res) => {
    try {
      const { loanType } = req.params;
      const Loan = require('../models/Loans');
      
      const loan = await Loan.findOne({ 
        loanType: new RegExp(loanType, 'i'),
        isActive: true 
      });

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan type not found'
        });
      }

      res.json({
        success: true,
        data: {
          loanType: loan.loanType,
          subType: loan.subType,
          requiredDocuments: loan.requiredDocuments || [],
          links: loan.links || []
        }
      });

    } catch (error) {
      console.error('Error fetching loan requirements:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching loan requirements'
      });
    }
  },

  // Upload single document during application process
  uploadSingleDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { documentType, isRequired } = req.body;

      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }

      // Return file information with relative path
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../uploads');
      const relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
      
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: relativePath,
          size: req.file.size,
          documentType: documentType,
          isRequired: isRequired === 'true'
        }
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while uploading document'
      });
    }
  }
};

module.exports = applicationController;