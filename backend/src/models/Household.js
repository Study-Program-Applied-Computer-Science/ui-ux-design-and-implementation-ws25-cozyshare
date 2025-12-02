const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // invite code
  },
  { timestamps: true }
);

module.exports = mongoose.model("Household", householdSchema);
