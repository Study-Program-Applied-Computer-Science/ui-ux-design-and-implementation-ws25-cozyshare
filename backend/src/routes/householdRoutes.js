const express = require("express");
const router = express.Router();

const Household = require("../models/Household");
const User = require("../models/User");

// Helper: find household by either field name (backward/forward compatible)
async function findHouseholdByCode(code) {
  return Household.findOne({
    $or: [{ householdCode: code }, { code: code }],
  });
}

// GET /api/households/:code/members
router.get("/:code/members", async (req, res) => {
  try {
    const { code } = req.params;

    // FIX: don't reference undefined householdCode
    const household = await findHouseholdByCode(code);

    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    // Use the actual stored code to fetch users
    const actualCode = household.householdCode || household.code;

    // Source of truth: Users
    const users = await User.find({ householdCode: actualCode }).select("name email");

    // If users not found (common right after create), fallback to household.members
    if (!users || users.length === 0) {
      // members in your schema are strings, so return {name,email:null}
      const members = (household.members || []).map((m) => ({
        name: m,
        email: null,
      }));
      return res.json(members);
    }

    return res.json(users);
  } catch (err) {
    console.error("Fetch household members error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/households  (Create new household)
router.post("/", async (req, res) => {
  try {
    const { name, ownerName } = req.body;

    if (!name || !ownerName) {
      return res.status(400).json({ message: "name and ownerName are required" });
    }

    // generate unique code (retry a few times to avoid collisions)
    let code;
    for (let i = 0; i < 10; i++) {
      const candidate = Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await Household.findOne({
        $or: [{ householdCode: candidate }, { code: candidate }],
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return res.status(500).json({ message: "Could not generate unique household code" });
    }

    // FIX: members must be array of strings
    // Keep both fields for compatibility with rest of your app
    const household = await Household.create({
      name,
      householdCode: code,
      code: code,
      members: [ownerName],
    });

    return res.status(201).json(household);
  } catch (err) {
    console.error("Create household error:", err);
    res.status(500).json({ message: "Server error creating household" });
  }
});

module.exports = router;
