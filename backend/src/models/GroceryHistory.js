const mongoose = require("mongoose");

const groceryHistorySchema = new mongoose.Schema(
  {
    householdCode: { type: String, required: true, index: true },
    groceryId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    name: { type: String, required: true },
    quantity: { type: String, default: "1" },
    category: { type: String, default: "Other" },

    addedBy: { type: String, default: "Unknown" },
    purchasedBy: { type: String, default: "Unknown" },
    purchasedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroceryHistory", groceryHistorySchema);
