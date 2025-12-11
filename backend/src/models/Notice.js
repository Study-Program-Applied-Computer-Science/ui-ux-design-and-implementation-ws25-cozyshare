// backend/src/models/Notice.js
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, default: 'Someone' },
    householdCode: { type: String, required: true },
    likes: [{ type: String }], // store user emails/names who liked
    comments: [commentSchema],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Notice', noticeSchema)
