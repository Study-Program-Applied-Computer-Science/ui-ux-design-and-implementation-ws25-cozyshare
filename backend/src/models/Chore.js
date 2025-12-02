// backend/src/models/Chore.js
const mongoose = require("mongoose");

const choreSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    assignedTo: { type: String, required: true }, // e.g. user name or email
    dueDate: { type: Date },                      // optional
    isDone: { type: Boolean, default: false },
    createdBy: { type: String, required: true },  // who created (email or name)
    householdCode: { type: String, required: true }, // which household this belongs to
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chore", choreSchema);
