// backend/src/routes/groceryRoutes.js
const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");

// GET /api/groceries?householdCode=ABC123
router.get("/", async (req, res) => {
  try {
    const { householdCode } = req.query;

    if (!householdCode) {
      return res.status(400).json({ message: "householdCode is required" });
    }

    // Unpurchased first, then purchased, newest first
    const groceries = await Grocery.find({ householdCode }).sort({
      isPurchased: 1,
      createdAt: -1,
    });

    res.json(groceries);
  } catch (err) {
    console.error("Error fetching groceries:", err);
    res.status(500).json({ message: "Error fetching groceries" });
  }
});

// POST /api/groceries
router.post("/", async (req, res) => {
  try {
    const { name, category, quantity, householdCode, addedBy } = req.body;

    if (!name || !householdCode || !addedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const grocery = await Grocery.create({
      name,
      category: category || "Other",
      quantity: quantity || "1",
      householdCode,
      addedBy,
    });

    res.status(201).json(grocery);
  } catch (err) {
    console.error("Error creating grocery:", err);
    res.status(500).json({ message: "Error creating grocery" });
  }
});

// PATCH /api/groceries/:id/toggle  (toggle purchased flag)
router.patch("/:id/toggle", async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    if (!grocery) {
      return res.status(404).json({ message: "Grocery item not found" });
    }

    grocery.isPurchased = !grocery.isPurchased;
    await grocery.save();

    res.json(grocery);
  } catch (err) {
    console.error("Error toggling grocery:", err);
    res.status(500).json({ message: "Error toggling grocery" });
  }
});

// DELETE /api/groceries/:id
router.delete("/:id", async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndDelete(req.params.id);
    if (!grocery) {
      return res.status(404).json({ message: "Grocery item not found" });
    }

    res.json({ message: "Grocery item deleted" });
  } catch (err) {
    console.error("Error deleting grocery:", err);
    res.status(500).json({ message: "Error deleting grocery" });
  }
});

module.exports = router;
