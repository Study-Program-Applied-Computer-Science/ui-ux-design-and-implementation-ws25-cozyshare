// backend/src/routes/choreRoutes.js
const express = require("express");
const router = express.Router();
const Chore = require("../models/Chore");

// GET /api/chores householdCode=ABC123
router.get("/", async (req, res) => {
  try {
    const { householdCode } = req.query;

    if (!householdCode) {
      return res.status(400).json({ message: "householdCode is required" });
    }

    const chores = await Chore.find({ householdCode }).sort({ createdAt: -1 });
    res.json(chores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chores" });
  }
});

// POST /api/chores
router.post("/", async (req, res) => {
  try {
    const { title, assignedTo, dueDate, createdBy, householdCode } = req.body;

    if (!title || !assignedTo || !createdBy || !householdCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const chore = await Chore.create({
      title,
      assignedTo,
      dueDate: dueDate || null,
      isDone: false,
      createdBy,
      householdCode,
    });

    res.status(201).json(chore);
  } catch (err) {
    res.status(500).json({ message: "Error creating chore" });
  }
});

// PATCH /api/chores/:id/toggle
router.patch("/:id/toggle", async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({ message: "Chore not found" });
    }

    chore.isDone = !chore.isDone;
    await chore.save();

    res.json(chore);
  } catch (err) {
    res.status(500).json({ message: "Error updating chore" });
  }
});

// DELETE /api/chores/:id
router.delete("/:id", async (req, res) => {
  try {
    const chore = await Chore.findByIdAndDelete(req.params.id);
    if (!chore) {
      return res.status(404).json({ message: "Chore not found" });
    }

    res.json({ message: "Chore deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting chore" });
  }
});

module.exports = router;
