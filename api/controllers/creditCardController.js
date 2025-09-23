const CreditCard = require("../models/CreditCards");
const queryService = require("../services/queryService");

// CREATE
exports.createCreditCard = async (req, res, next) => {
  try {
    const { creditCardName, cibilRange } = req.body;
    const creditCardPic = req.file ? req.file.path : null;

    const card = await CreditCard.create({ creditCardName, cibilRange, creditCardPic });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
};

// READ ALL
exports.getAllCreditCards = async (req, res, next) => {
  try {
    const { data, pagination } = await queryService.query(CreditCard, req.query, ['creditCardName', 'cibilRange']);
    res.json({
      cards: data,
      pagination
    });
  } catch (err) {
    next(err);
  }
};

// READ ONE
exports.getCreditCardById = async (req, res, next) => {
  try {
    const card = await CreditCard.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Credit Card not found" });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateCreditCard = async (req, res, next) => {
  try {
    const { creditCardName, cibilRange } = req.body;
    const updateData = { creditCardName, cibilRange };
    if (req.file) updateData.creditCardPic = req.file.path;

    const card = await CreditCard.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!card) return res.status(404).json({ error: "Credit Card not found" });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteCreditCard = async (req, res, next) => {
  try {
    const card = await CreditCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ error: "Credit Card not found" });
    res.json({ message: "Credit Card deleted successfully" });
  } catch (err) {
    next(err);
  }
};
