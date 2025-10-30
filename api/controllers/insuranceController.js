const Insurance = require('../models/Insurance');
const { validationResult } = require('express-validator');

const insuranceController = {
  // Get all insurance types with their subtypes (compatible with existing frontend)
  getInsurances: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        includeInactive = false,
        search = ''
      } = req.query;
      
      const filter = includeInactive === 'true' ? {} : { isActive: true };
      
      // Add search functionality
      if (search) {
        filter.$or = [
          { insuranceType: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [insuranceTypes, total] = await Promise.all([
        Insurance.find(filter)
          .sort({ displayOrder: 1, insuranceType: 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Insurance.countDocuments(filter)
      ]);

      res.json({
        success: true,
        items: insuranceTypes, // Frontend expects 'items' property
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching insurance types:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching insurance types'
      });
    }
  },

  // Alias for backward compatibility
  getInsuranceTypes: async (req, res) => {
    return await insuranceController.getInsurances(req, res);
  },

  // Get specific insurance type by ID
  getInsuranceType: async (req, res) => {
    try {
      const { id } = req.params;

      const insuranceType = await Insurance.findById(id);

      if (!insuranceType) {
        return res.status(404).json({
          success: false,
          message: 'Insurance type not found'
        });
      }

      res.json({
        success: true,
        data: insuranceType
      });

    } catch (error) {
      console.error('Error fetching insurance type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching insurance type'
      });
    }
  },

  // Create new insurance type
  createInsuranceType: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const insuranceData = req.body;

      // Check if insurance type already exists
      const existingType = await Insurance.findOne({ 
        insuranceType: { $regex: new RegExp(`^${insuranceData.insuranceType}$`, 'i') }
      });

      if (existingType) {
        return res.status(409).json({
          success: false,
          message: 'Insurance type already exists'
        });
      }

      const insurance = new Insurance(insuranceData);
      await insurance.save();

      res.status(201).json({
        success: true,
        message: 'Insurance type created successfully',
        data: insurance
      });

    } catch (error) {
      console.error('Error creating insurance type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating insurance type'
      });
    }
  },

  // Update insurance type
  updateInsuranceType: async (req, res) => {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const updateData = req.body;

      // Check if another insurance type with same name exists
      if (updateData.insuranceType) {
        const existingType = await Insurance.findOne({ 
          _id: { $ne: id },
          insuranceType: { $regex: new RegExp(`^${updateData.insuranceType}$`, 'i') }
        });

        if (existingType) {
          return res.status(409).json({
            success: false,
            message: 'Insurance type with this name already exists'
          });
        }
      }

      const insurance = await Insurance.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!insurance) {
        return res.status(404).json({
          success: false,
          message: 'Insurance type not found'
        });
      }

      res.json({
        success: true,
        message: 'Insurance type updated successfully',
        data: insurance
      });

    } catch (error) {
      console.error('Error updating insurance type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating insurance type'
      });
    }
  },

  // Delete insurance type
  deleteInsuranceType: async (req, res) => {
    try {
      const { id } = req.params;

      const insurance = await Insurance.findByIdAndDelete(id);

      if (!insurance) {
        return res.status(404).json({
          success: false,
          message: 'Insurance type not found'
        });
      }

      res.json({
        success: true,
        message: 'Insurance type deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting insurance type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting insurance type'
      });
    }
  },

  // Get subtypes for a specific insurance type
  getSubTypes: async (req, res) => {
    try {
      const { insuranceType } = req.params;
      const { includeInactive = false } = req.query;

      const insurance = await Insurance.findOne({ 
        insuranceType: { $regex: new RegExp(`^${insuranceType}$`, 'i') },
        isActive: true 
      });

      if (!insurance) {
        return res.status(404).json({
          success: false,
          message: 'Insurance type not found'
        });
      }

      let subTypes = insurance.subTypes;
      
      if (includeInactive !== 'true') {
        subTypes = subTypes.filter(subType => subType.isActive);
      }

      res.json({
        success: true,
        data: subTypes,
        insuranceType: insurance.insuranceType
      });

    } catch (error) {
      console.error('Error fetching subtypes:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching subtypes'
      });
    }
  },

  // Validate insurance type and subtype combination
  validateInsuranceTypeSubType: async (req, res) => {
    try {
      const { insuranceType, subType } = req.query;

      if (!insuranceType || !subType) {
        return res.status(400).json({
          success: false,
          message: 'Both insuranceType and subType are required'
        });
      }

      const insurance = await Insurance.findOne({ 
        insuranceType: { $regex: new RegExp(`^${insuranceType}$`, 'i') },
        isActive: true 
      });

      if (!insurance) {
        return res.status(404).json({
          success: false,
          message: 'Insurance type not found',
          valid: false
        });
      }

      const validSubType = insurance.subTypes.find(
        st => st.name.toLowerCase() === subType.toLowerCase() && st.isActive
      );

      if (!validSubType) {
        return res.status(404).json({
          success: false,
          message: 'Invalid subtype for this insurance type',
          valid: false
        });
      }

      res.json({
        success: true,
        message: 'Valid insurance type and subtype combination',
        valid: true,
        data: {
          insuranceType: insurance.insuranceType,
          subType: validSubType.name
        }
      });

    } catch (error) {
      console.error('Error validating insurance type/subtype:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while validating'
      });
    }
  }
};

module.exports = insuranceController;