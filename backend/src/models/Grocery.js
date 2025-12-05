// backend/src/models/Grocery.js
const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },            // e.g. Milk
    category: { type: String, default: "Other" },      // Produce, Snacks, Cleaning, etc.
    quantity: { type: String, default: "1" },          // e.g. "2 packs", "1L"
    isPurchased: { type: Boolean, default: false },    // bought or not
    householdCode: { type: String, required: true },   // which household
    addedBy: { type: String, required: true },         // who added (name or email)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grocery", grocerySchema);
