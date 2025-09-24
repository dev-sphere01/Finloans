const Loan = require("../models/Loans");
const queryService = require("../services/queryService");

// Helper to normalize `links` into an array of strings
function normalizeLinks(links) {
  if (links == null) return [];
  if (Array.isArray(links)) return links;
  if (typeof links === "string") {
    try {
      const parsed = JSON.parse(links);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return links.length ? [links] : [];
  }
  return [];
}

// CREATE
exports.createLoan = async (req, res, next) => {
  try {
    const { loanType, links } = req.body;

    const loan = await Loan.create({
      loanType,
      links: normalizeLinks(links),
    });

    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
};

// READ ALL
exports.getAllLoans = async (req, res, next) => {
  try {
    const { data, pagination } = await queryService.query(Loan, req.query, ['loanType']);
    res.json({
      items: data,
      pagination
    });
  } catch (err) {
    next(err);
  }
};

// READ ONE
exports.getLoanById = async (req, res, next) => {
  try {
    const item = await Loan.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Loan not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateLoan = async (req, res, next) => {
  try {
    const { loanType, links } = req.body;

    const updateData = {};
    if (loanType !== undefined) updateData.loanType = loanType;
    if (links !== undefined) updateData.links = normalizeLinks(links);

    const item = await Loan.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ error: "Loan not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteLoan = async (req, res, next) => {
  try {
    const item = await Loan.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Loan not found" });
    res.json({ message: "Loan deleted successfully" });
  } catch (err) {
    next(err);
  }
};