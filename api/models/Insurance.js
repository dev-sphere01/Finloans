const mongoose = require("mongoose");

// Insurance schema with support for types and subtypes
const insuranceSchema = new mongoose.Schema(
  {
    insuranceType: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    subTypes: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
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
    // Additional metadata for better organization
    icon: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for better performance
insuranceSchema.index({ insuranceType: 1 });
insuranceSchema.index({ isActive: 1 });

module.exports = mongoose.model("Insurance", insuranceSchema);