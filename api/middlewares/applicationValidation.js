const { body } = require('express-validator');
const Insurance = require('../models/Insurance');

const applicationValidation = {
  // Basic validation rules for all applications
  basicValidation: [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),

    body('panNumber')
      .trim()
      .notEmpty()
      .withMessage('PAN number is required')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage('Invalid PAN format (e.g., ABCDE1234F)'),

    body('dateOfBirth')
      .notEmpty()
      .withMessage('Date of birth is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18 || age > 70) {
          throw new Error('Age must be between 18 and 70 years');
        }
        return true;
      }),

    body('mobileNumber')
      .trim()
      .notEmpty()
      .withMessage('Mobile number is required')
      .matches(/^[6-9][0-9]{9}$/)
      .withMessage('Invalid mobile number format'),

    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters'),

    body('aadhaarNumber')
      .trim()
      .notEmpty()
      .withMessage('Aadhaar number is required')
      .matches(/^[0-9]{12}$/)
      .withMessage('Invalid Aadhaar format (12 digits required)'),

    body('currentAddress')
      .trim()
      .notEmpty()
      .withMessage('Current address is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10 and 500 characters'),

    body('serviceType')
      .notEmpty()
      .withMessage('Service type is required')
      .isIn(['credit-card', 'insurance', 'loan'])
      .withMessage('Invalid service type')
  ],

  // Credit card specific validation
  creditCardValidation: [
    body('monthlyIncome')
      .if(body('serviceType').equals('credit-card'))
      .notEmpty()
      .withMessage('Monthly income is required for credit card applications')
      .isNumeric()
      .withMessage('Monthly income must be a number')
      .custom((value) => {
        if (value < 10000) {
          throw new Error('Monthly income must be at least ₹10,000');
        }
        return true;
      }),

    body('employmentType')
      .if(body('serviceType').equals('credit-card'))
      .notEmpty()
      .withMessage('Employment type is required for credit card applications')
      .isIn(['salaried', 'self-employed', 'business', 'freelancer'])
      .withMessage('Invalid employment type'),

    body('companyName')
      .if(body('serviceType').equals('credit-card'))
      .trim()
      .notEmpty()
      .withMessage('Company name is required for credit card applications')
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),

    body('workExperience')
      .if(body('serviceType').equals('credit-card'))
      .optional()
      .isNumeric()
      .withMessage('Work experience must be a number')
      .custom((value) => {
        if (value < 0 || value > 50) {
          throw new Error('Work experience must be between 0 and 50 years');
        }
        return true;
      }),

    body('creditScore')
      .optional()
      .isNumeric()
      .withMessage('Credit score must be a number')
      .custom((value) => {
        if (value && (value < 300 || value > 900)) {
          throw new Error('Credit score must be between 300 and 900');
        }
        return true;
      })
  ],

  // Insurance specific validation
  insuranceValidation: [
    body('subType')
      .if(body('serviceType').equals('insurance'))
      .notEmpty()
      .withMessage('Insurance subtype is required')
      .custom(async (value, { req }) => {
        if (req.body.serviceType === 'insurance') {
          // Get the insurance type from the request (could be in insuranceType field or derived from subType)
          const insuranceType = req.body.insuranceType || 'General'; // Default fallback
          
          try {
            // Find the insurance type in masters
            const insurance = await Insurance.findOne({ 
              insuranceType: { $regex: new RegExp(`^${insuranceType}$`, 'i') },
              isActive: true 
            });

            if (!insurance) {
              throw new Error(`Invalid insurance type: ${insuranceType}`);
            }

            // Check if the subtype exists and is active
            const validSubType = insurance.subTypes.find(
              st => st.name.toLowerCase() === value.toLowerCase() && st.isActive
            );

            if (!validSubType) {
              const availableSubTypes = insurance.subTypes
                .filter(st => st.isActive)
                .map(st => st.name)
                .join(', ');
              throw new Error(`Invalid insurance subtype. Available subtypes for ${insuranceType}: ${availableSubTypes}`);
            }
          } catch (error) {
            throw new Error(error.message || 'Error validating insurance type and subtype');
          }
        }
        return true;
      }),

    body('coverageAmount')
      .if(body('serviceType').equals('insurance'))
      .notEmpty()
      .withMessage('Coverage amount is required for insurance applications')
      .isNumeric()
      .withMessage('Coverage amount must be a number')
      .custom((value) => {
        if (value < 100000) {
          throw new Error('Coverage amount must be at least ₹1,00,000');
        }
        return true;
      }),

    body('nomineeDetails')
      .if(body('serviceType').equals('insurance'))
      .trim()
      .notEmpty()
      .withMessage('Nominee details are required for insurance applications')
      .isLength({ min: 5, max: 200 })
      .withMessage('Nominee details must be between 5 and 200 characters'),

    // Vehicle insurance specific
    body('vehicleNumber')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'insurance' && req.body.subType === 'vehicle') {
          if (!value || value.trim() === '') {
            throw new Error('Vehicle number is required for vehicle insurance');
          }
        }
        return true;
      }),

    body('vehicleModel')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'insurance' && req.body.subType === 'vehicle') {
          if (!value || value.trim() === '') {
            throw new Error('Vehicle model is required for vehicle insurance');
          }
        }
        return true;
      }),

    body('vehicleYear')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'insurance' && req.body.subType === 'vehicle') {
          if (!value) {
            throw new Error('Vehicle year is required for vehicle insurance');
          }
          if (isNaN(value)) {
            throw new Error('Vehicle year must be a number');
          }
          const currentYear = new Date().getFullYear();
          if (value < 1990 || value > currentYear) {
            throw new Error(`Vehicle year must be between 1990 and ${currentYear}`);
          }
        }
        return true;
      }),

    // Property insurance specific
    body('propertyType')
      .custom((value, { req }) => {
        // Only validate if it's property insurance
        if (req.body.serviceType === 'insurance' && req.body.subType === 'property') {
          if (!value || value.trim() === '') {
            throw new Error('Property type is required for property insurance');
          }
          if (!['residential', 'commercial', 'industrial'].includes(value)) {
            throw new Error('Invalid property type');
          }
        }
        return true;
      }),

    body('propertyValue')
      .if((value, { req }) => req.body.serviceType === 'insurance' && req.body.subType === 'property')
      .notEmpty()
      .withMessage('Property value is required for property insurance')
      .isNumeric()
      .withMessage('Property value must be a number')
      .custom((value) => {
        if (value < 500000) {
          throw new Error('Property value must be at least ₹5,00,000');
        }
        return true;
      })
  ],

  // Loan specific validation
  loanValidation: [
    body('subType')
      .if(body('serviceType').equals('loan'))
      .notEmpty()
      .withMessage('Loan type is required')
      .isIn(['personal', 'home', 'business', 'education'])
      .withMessage('Invalid loan type'),

    body('loanAmount')
      .if(body('serviceType').equals('loan'))
      .notEmpty()
      .withMessage('Loan amount is required for loan applications')
      .isNumeric()
      .withMessage('Loan amount must be a number')
      .custom((value) => {
        if (value < 1) {
          throw new Error('Loan amount must be at least ₹1');
        }
        return true;
      }),

    body('loanPurpose')
      .if(body('serviceType').equals('loan'))
      .trim()
      .notEmpty()
      .withMessage('Loan purpose is required for loan applications')
      .isLength({ min: 10, max: 500 })
      .withMessage('Loan purpose must be between 10 and 500 characters'),

    body('monthlyIncome')
      .if(body('serviceType').equals('loan'))
      .notEmpty()
      .withMessage('Monthly income is required for loan applications')
      .isNumeric()
      .withMessage('Monthly income must be a number')
      .custom((value) => {
        if (value < 1) {
          throw new Error('Monthly income is Required');
        }
        return true;
      }),

    // Business loan specific
    body('businessType')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'loan' && req.body.subType === 'business') {
          if (!value || value.trim() === '') {
            throw new Error('Business type is required for business loans');
          }
        }
        return true;
      }),

    body('businessAge')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'loan' && req.body.subType === 'business') {
          if (!value) {
            throw new Error('Business age is required for business loans');
          }
          if (isNaN(value)) {
            throw new Error('Business age must be a number');
          }
          if (value < 1 || value > 100) {
            throw new Error('Business age must be between 1 and 100 years');
          }
        }
        return true;
      }),

    body('annualTurnover')
      .custom((value, { req }) => {
        if (req.body.serviceType === 'loan' && req.body.subType === 'business') {
          if (!value) {
            throw new Error('Annual turnover is required for business loans');
          }
          if (isNaN(value)) {
            throw new Error('Annual turnover must be a number');
          }
          if (value < 500000) {
            throw new Error('Annual turnover must be at least ₹5,00,000');
          }
        }
        return true;
      })
  ],

  // Combined validation for application submission
  validateApplication: function () {
    return [
      ...this.basicValidation,
      ...this.creditCardValidation,
      ...this.insuranceValidation,
      ...this.loanValidation
    ];
  }
};

module.exports = applicationValidation;