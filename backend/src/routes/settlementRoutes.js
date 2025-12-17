const express = require("express");
const router = express.Router();
const Settlement = require("../models/Settlement");

// GET /api/settlements?householdCode=XXXX
router.get("/", async (req, res) => {
	try {
		const { householdCode } = req.query;
		if (!householdCode) {
			return res.status(400).json({ message: "householdCode is required" });
		}

		const settlements = await Settlement.find({ householdCode }).sort({
			createdAt: -1,
		});
		res.json(settlements);
	} catch (err) {
		console.error("Get settlements error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

// POST /api/settlements
router.post("/", async (req, res) => {
	try {
		const { householdCode, from, to, amount } = req.body;

		if (!householdCode || !from || !to || !amount) {
			return res
				.status(400)
				.json({ message: "householdCode, from, to, amount are required" });
		}

		const settlement = await Settlement.create({
			householdCode,
			from,
			to,
			amount: Number(amount),
		});

		res.status(201).json(settlement);
	} catch (err) {
		console.error("Create settlement error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

// DELETE /api/settlements/:id  (undo)
router.delete("/:id", async (req, res) => {
	try {
		const deleted = await Settlement.findByIdAndDelete(req.params.id);
		if (!deleted)
			return res.status(404).json({ message: "Settlement not found" });

		res.sendStatus(204);
	} catch (err) {
		console.error("Delete settlement error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
