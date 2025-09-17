const Insurance = require("../models/Insurance");

// Helper to normalize `links` into an array of strings
function normalizeLinks(links) {
  if (links == null) return [];
  if (Array.isArray(links)) return links;
  if (typeof links === "string") {
    // Try parse if it's JSON array in string
    try {
      const parsed = JSON.parse(links);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return links.length ? [links] : [];
  }
  return [];
}

// CREATE
exports.createInsurance = async (req, res, next) => {
  try {
    const { insuranceType, links } = req.body;

    const insurance = await Insurance.create({
      insuranceType,
      links: normalizeLinks(links),
    });

    res.status(201).json(insurance);
  } catch (err) {
    next(err);
  }
};

// READ ALL
exports.getAllInsurances = async (req, res, next) => {
  try {
    const items = await Insurance.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// READ ONE
exports.getInsuranceById = async (req, res, next) => {
  try {
    const item = await Insurance.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Insurance not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateInsurance = async (req, res, next) => {
  try {
    const { insuranceType, links } = req.body;

    const updateData = {};
    if (insuranceType !== undefined) updateData.insuranceType = insuranceType;
    if (links !== undefined) updateData.links = normalizeLinks(links);

    const item = await Insurance.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ error: "Insurance not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteInsurance = async (req, res, next) => {
  try {
    const item = await Insurance.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Insurance not found" });
    res.json({ message: "Insurance deleted successfully" });
  } catch (err) {
    next(err);
  }
};