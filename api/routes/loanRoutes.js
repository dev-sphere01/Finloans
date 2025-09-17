const express = require("express");
const router = express.Router();

const {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} = require("../controllers/loanController");

// CRUD routes
router.post("/", createLoan);
router.get("/", getAllLoans);
router.get("/:id", getLoanById);
router.put("/:id", updateLoan);
router.delete("/:id", deleteLoan);

module.exports = router;