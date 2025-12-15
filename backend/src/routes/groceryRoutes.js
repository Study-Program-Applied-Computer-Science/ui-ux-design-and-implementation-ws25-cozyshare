const express = require("express");
const router = express.Router();

const Grocery = require("../models/Grocery"); // your existing Grocery model
const GroceryHistory = require("../models/GroceryHistory");

// GET current groceries (all)
router.get("/", async (req, res) => {
  try {
    const { householdCode } = req.query;
    if (!householdCode) return res.status(400).json({ message: "householdCode required" });

    const groceries = await Grocery.find({ householdCode }).sort({ createdAt: -1 });
    res.json(groceries);
  } catch (err) {
    console.error("GET groceries error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET history
router.get("/history", async (req, res) => {
  try {
    const { householdCode, limit = 50 } = req.query;
    if (!householdCode) return res.status(400).json({ message: "householdCode required" });

    const history = await GroceryHistory.find({ householdCode })
      .sort({ purchasedAt: -1 })
      .limit(Number(limit));

    res.json(history);
  } catch (err) {
    console.error("GET grocery history error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create grocery
router.post("/", async (req, res) => {
  try {
    const { name, quantity, category, householdCode, addedBy } = req.body;

    if (!name || !householdCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created = await Grocery.create({
      name,
      quantity: quantity || "1",
      category: category || "Other",
      householdCode,
      addedBy: addedBy || "Unknown",
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Create grocery error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH toggle purchase
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentUser } = req.body;

    const grocery = await Grocery.findById(id);
    if (!grocery) return res.status(404).json({ message: "Grocery not found" });

    // toggle
    const wasPurchased = !!grocery.isPurchased;

    if (!wasPurchased) {
      // Mark as purchased
      grocery.isPurchased = true;
      grocery.purchasedBy = currentUser || "Unknown";
      grocery.purchasedAt = new Date();

      await grocery.save();

      // Add to history
      await GroceryHistory.create({
        householdCode: grocery.householdCode,
        groceryId: grocery._id,
        name: grocery.name,
        quantity: grocery.quantity || "1",
        category: grocery.category || "Other",
        addedBy: grocery.addedBy || "Unknown",
        purchasedBy: grocery.purchasedBy || "Unknown",
        purchasedAt: grocery.purchasedAt,
      });

      return res.json(grocery);
    } else {
      // UNDO purchase (make pending again)
      grocery.isPurchased = false;
      grocery.purchasedBy = null;
      grocery.purchasedAt = null;

      await grocery.save();

      // IMPORTANT FIX:
      // remove the latest history entry for this grocery item
      await GroceryHistory.findOneAndDelete(
        { householdCode: grocery.householdCode, groceryId: grocery._id },
        { sort: { purchasedAt: -1 } }
      );

      return res.json(grocery);
    }
  } catch (err) {
    console.error("Toggle grocery error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE grocery
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await Grocery.findByIdAndDelete(id);

    // optional: also remove related history
    await GroceryHistory.deleteMany({ groceryId: id });

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete grocery error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
