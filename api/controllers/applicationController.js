const Application = require('../models/Application');
const CreditCard = require('../models/CreditCards');
const { validationResult } = require('express-validator');

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

      // Check for duplicate applications (same PAN + service type within 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const existingApplication = await Application.findOne({
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
  }
};

module.exports = applicationController;