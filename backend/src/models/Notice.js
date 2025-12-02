// backend/src/models/Notice.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, required: true }, // name or email
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: String, required: true },     // name or email
    householdCode: { type: String, required: true }, // which household
    likes: { type: [String], default: [] },          // array of user emails who liked
    comments: { type: [commentSchema], default: [] } // embedded comments
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
