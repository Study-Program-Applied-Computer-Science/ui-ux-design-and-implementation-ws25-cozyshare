const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // unique invite code (e.g. EXNY2S)
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Household", householdSchema);
