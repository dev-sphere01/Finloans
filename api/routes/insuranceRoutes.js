const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const insuranceValidation = require('../middlewares/insuranceValidation');

// Get all insurance types with subtypes (main endpoint for frontend)
router.get('/', 
  insuranceValidation.getInsuranceTypes,
  insuranceController.getInsurances
);

// Get specific insurance type by ID
router.get('/:id', 
  insuranceController.getInsuranceType
);

// Create new insurance type
router.post('/', 
  insuranceValidation.createInsuranceType,
  insuranceController.createInsuranceType
);

// Update insurance type
router.put('/:id', 
  insuranceValidation.updateInsuranceType,
  insuranceController.updateInsuranceType
);

// Delete insurance type
router.delete('/:id', 
  insuranceController.deleteInsuranceType
);

// Get subtypes for specific insurance type
router.get('/type/:insuranceType/subtypes', 
  insuranceController.getSubTypes
);

// Validate insurance type and subtype combination
router.get('/validate/type-subtype', 
  insuranceValidation.validateTypeSubType,
  insuranceController.validateInsuranceTypeSubType
);

module.exports = router;