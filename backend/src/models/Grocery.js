const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: "1" },
    category: { type: String, default: "Other" },

    isPurchased: { type: Boolean, default: false },
    householdCode: { type: String, required: true, index: true },

    addedBy: { type: String, required: true },      // name or email
    purchasedBy: { type: String },                  // name or email
    purchasedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grocery", grocerySchema);
