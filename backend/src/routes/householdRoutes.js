const express = require("express");
const router = express.Router();
const Household = require("../models/Household");

// GET members by householdCode
router.get("/:householdCode/members", async (req, res) => {
	try {
		const { householdCode } = req.params;

		const household = await Household.findOne({ householdCode });

		if (!household) {
			return res.status(404).json({ message: "Household not found" });
		}

		res.json(household.members);
	} catch (err) {
		console.error("Fetch household members error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
