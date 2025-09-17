const mongoose = require("mongoose");

// Insurance schema
// - insuranceType: type/name of insurance (e.g., Health, Life, Vehicle)
// - links: array of strings (e.g., URLs or references)
const insuranceSchema = new mongoose.Schema(
  {
    insuranceType: {
      type: String,
      required: true,
      trim: true,
    },
    links: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: "Links must be an array",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Insurance", insuranceSchema);