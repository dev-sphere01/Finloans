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
    subType: {
      type: String,
      trim: true,
      default: '',
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
    requiredDocuments: {
      type: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        isRequired: {
          type: Boolean,
          default: true
        },
        description: {
          type: String,
          trim: true,
          default: ''
        }
      }],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);