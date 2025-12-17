const express = require("express");
const router = express.Router();

const Household = require("../models/Household");
const User = require("../models/User");

// GET /api/households/:code/members
router.get("/:code/members", async (req, res) => {
	try {
		const { code } = req.params;

		// 1) Verify household exists (Household has field: code)
		const household = await Household.findOne({ code });
		if (!household) {
			return res.status(404).json({ message: "Household not found" });
		}

		// 2) Fetch members from User collection (source of truth)
		const users = await User.find({ householdCode: code }).select("name email");

		// Return an array of objects [{name,email}, ...]
		return res.json(users);
	} catch (err) {
		console.error("Fetch household members error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
