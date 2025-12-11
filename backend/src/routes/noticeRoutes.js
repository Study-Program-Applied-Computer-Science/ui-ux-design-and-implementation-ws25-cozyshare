// backend/src/routes/noticeRoutes.js
const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");

// GET /api/notices?householdCode=XXXX
router.get('/', async (req, res) => {
  try {
    const { householdCode } = req.query
    const filter = {}

    if (householdCode) {
      filter.householdCode = householdCode
    }

    const notices = await Notice.find(filter).sort({ createdAt: -1 })
    res.json(notices)
  } catch (err) {
    console.error('Get notices error:', err)
    res.status(500).json({ message: 'Server error fetching notices' })
  }
});

// POST /api/notices
router.post('/', async (req, res) => {
  try {
    const { title, message, householdCode, author } = req.body

    // 👇 This is where your 400 is coming from
    if (!title || !message || !householdCode) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const notice = await Notice.create({
      title,
      message,
      householdCode,
      author: author || 'Someone',
      likes: [],
      comments: [],
    })

    res.status(201).json(notice)
  } catch (err) {
    console.error('Create notice error:', err)
    res.status(500).json({ message: 'Server error creating notice' })
  }
});
// PUT /api/notices/:id  (edit title/message)
router.put("/:id", async (req, res) => {
  try {
    const { title, message } = req.body;

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (title) notice.title = title;
    if (message) notice.message = message;

    await notice.save();

    res.json(notice);
  } catch (err) {
    console.error("Error updating notice:", err);
    res.status(500).json({ message: "Error updating notice" });
  }
});

// PATCH /api/notices/:id/like  (toggle like for a user)
router.patch("/:id/like", async (req, res) => {
  try {
    const { user } = req.body; // email or id

    if (!user) {
      return res.status(400).json({ message: "user is required" });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const index = notice.likes.indexOf(user);
    if (index === -1) {
      notice.likes.push(user);      // like
    } else {
      notice.likes.splice(index, 1); // unlike
    }

    await notice.save();
    res.json(notice);
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
});

// POST /api/notices/:id/comments  (add comment)
router.post("/:id/comments", async (req, res) => {
  try {
    const { text, author } = req.body;

    if (!text || !author) {
      return res.status(400).json({ message: "text and author are required" });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    notice.comments.push({ text, author });
    await notice.save();

    res.json(notice);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Error adding comment" });
  }
});

// DELETE /api/notices/:id
router.delete("/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted" });
  } catch (err) {
    console.error("Error deleting notice:", err);
    res.status(500).json({ message: "Error deleting notice" });
  }
});

module.exports = router;
