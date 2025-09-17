const express = require("express");
const router = express.Router();

const {
  createInsurance,
  getAllInsurances,
  getInsuranceById,
  updateInsurance,
  deleteInsurance,
} = require("../controllers/insuranceController");

// CRUD routes
router.post("/", createInsurance);
router.get("/", getAllInsurances);
router.get("/:id", getInsuranceById);
router.put("/:id", updateInsurance);
router.delete("/:id", deleteInsurance);

module.exports = router;