const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  createCreditCard,
  getAllCreditCards,
  getCreditCardById,
  updateCreditCard,
  deleteCreditCard,
} = require("../controllers/creditCardController");

// CRUD routes
router.post("/", upload.single("creditCardPic"), createCreditCard);
router.get("/", getAllCreditCards);
router.get("/:id", getCreditCardById);
router.put("/:id", upload.single("creditCardPic"), updateCreditCard);
router.delete("/:id", deleteCreditCard);

module.exports = router;
