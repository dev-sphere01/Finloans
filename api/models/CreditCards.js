const mongoose = require("mongoose");

const creditCardSchema = new mongoose.Schema(
  {
    creditCardName: {
      type: String,
      required: true,
      trim: true,
    },
    cibilRange: {
      type: String, // store as "700-750" string
      required: true,
      validate: {
        validator: function (v) {
          // Validate format like 700-750
          return /^\d{3}-\d{3}$/.test(v);
        },
        message: props => `${props.value} is not a valid CIBIL range (use e.g. 700-750)`,
      },
    },
    creditCardPic: {
      type: String, // will store file path or URL of uploaded image
      required: false,
    },
    link: {
      type: String,
      required: false,
      trim: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditCard", creditCardSchema);
