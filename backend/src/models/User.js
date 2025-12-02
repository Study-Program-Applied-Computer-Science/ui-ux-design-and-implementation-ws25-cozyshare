const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // already hashed
    householdCode: { type: String },            // invite code of joined/created household
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
