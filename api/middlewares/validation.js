const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('roleId')
    .isMongoId()
    .withMessage('Please provide a valid role ID'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('roleId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid role ID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('UserName')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('Password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('CurrentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('NewPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('UserName')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  handleValidationErrors
];

// Public registration validation (simpler than admin user registration)
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9][0-9]{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

// Role validation rules
const validateRoleCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces, underscores, and hyphens'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('permissions.*.resource')
    .if(body('permissions').exists())
    .trim()
    .notEmpty()
    .withMessage('Permission resource is required'),
  
  body('permissions.*.actions')
    .if(body('permissions').exists())
    .isArray({ min: 1 })
    .withMessage('Permission actions must be a non-empty array'),
  
  body('permissions.*.actions.*')
    .if(body('permissions').exists())
    .isIn(['create', 'read', 'update', 'delete', 'manage'])
    .withMessage('Invalid permission action'),
  
  handleValidationErrors
];

const validateRoleUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role name cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces, underscores, and hyphens'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

// Parameter validation
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Sort field cannot be empty'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Sort order must be asc, desc, 1, or -1'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserUpdate,
  validateLogin,
  validatePasswordChange,
  validatePasswordReset,
  validateRegistration,
  validateRoleCreation,
  validateRoleUpdate,
  validateMongoId,
  validatePagination,
  handleValidationErrors
};