const { body, query } = require('express-validator');

const insuranceValidation = {
  // Validation for creating insurance type
  createInsuranceType: [
    body('insuranceType')
      .notEmpty()
      .withMessage('Insurance type is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Insurance type must be between 2 and 50 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
      .trim(),
    
    body('subTypes')
      .optional()
      .isArray()
      .withMessage('SubTypes must be an array'),
    
    body('subTypes.*.name')
      .if(body('subTypes').exists())
      .notEmpty()
      .withMessage('SubType name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('SubType name must be between 2 and 50 characters')
      .trim(),
    
    body('subTypes.*.description')
      .optional()
      .isLength({ max: 200 })
      .withMessage('SubType description must not exceed 200 characters')
      .trim(),
    
    body('subTypes.*.isActive')
      .optional()
      .isBoolean()
      .withMessage('SubType isActive must be a boolean'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    
    body('links')
      .optional()
      .isArray()
      .withMessage('Links must be an array'),
    
    body('links.*')
      .if(body('links').exists())
      .isURL()
      .withMessage('Each link must be a valid URL'),
    
    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon must not exceed 50 characters')
      .trim(),
    
    body('color')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Color must not exceed 50 characters')
      .trim(),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],

  // Validation for updating insurance type
  updateInsuranceType: [
    body('insuranceType')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Insurance type must be between 2 and 50 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
      .trim(),
    
    body('subTypes')
      .optional()
      .isArray()
      .withMessage('SubTypes must be an array'),
    
    body('subTypes.*.name')
      .if(body('subTypes').exists())
      .notEmpty()
      .withMessage('SubType name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('SubType name must be between 2 and 50 characters')
      .trim(),
    
    body('subTypes.*.description')
      .optional()
      .isLength({ max: 200 })
      .withMessage('SubType description must not exceed 200 characters')
      .trim(),
    
    body('subTypes.*.isActive')
      .optional()
      .isBoolean()
      .withMessage('SubType isActive must be a boolean'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    
    body('links')
      .optional()
      .isArray()
      .withMessage('Links must be an array'),
    
    body('links.*')
      .if(body('links').exists())
      .isURL()
      .withMessage('Each link must be a valid URL'),
    
    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon must not exceed 50 characters')
      .trim(),
    
    body('color')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Color must not exceed 50 characters')
      .trim(),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],

  // Validation for query parameters
  getInsuranceTypes: [
    query('includeInactive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('includeInactive must be true or false')
  ],

  // Validation for subtype queries
  validateTypeSubType: [
    query('insuranceType')
      .notEmpty()
      .withMessage('Insurance type is required')
      .trim(),
    
    query('subType')
      .notEmpty()
      .withMessage('SubType is required')
      .trim()
  ]
};

module.exports = insuranceValidation;