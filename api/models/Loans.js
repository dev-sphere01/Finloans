const mongoose = require("mongoose");

// Loans schema
// - loanType: type/name of the loan (e.g., Personal, Home, Auto)
// - links: array of strings (e.g., URLs or references)
const loanSchema = new mongoose.Schema(
  {
    loanType: {
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

module.exports = mongoose.model("Loan", loanSchema);