// backend/src/routes/choreRoutes.js
const express = require("express");
const router = express.Router();
const Chore = require("../models/Chore");

// helper: start/end of week
// parse "YYYY-MM-DD" as a local date (no timezone shift)
function parseYMD(ymd) {
	const [y, m, d] = ymd.split("-").map(Number);
	return new Date(y, m - 1, d); // local date
}

function getWeekRange(date) {
	const d = new Date(date);
	// make Monday the first day (Europe style)
	const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
	const diff = day === 0 ? -6 : 1 - day; // shift to Monday
	const start = new Date(d);
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() + diff);

	const end = new Date(start);
	end.setDate(start.getDate() + 7); // [start, end)
	return { start, end };
}

// ---------- CREATE CHORE ----------
router.post("/", async (req, res) => {
	try {
		const {
			title,
			description,
			householdCode,
			createdBy,
			assignedTo,
			dueDate,
			frequency,
		} = req.body;

		if (!title || !householdCode || !createdBy || !dueDate) {
			return res
				.status(400)
				.json({
					message: "Title, householdCode, createdBy and dueDate are required",
				});
		}

		let due;
		if (typeof dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
			// from <input type="date">: treat as LOCAL date
			due = parseYMD(dueDate);
		} else {
			due = new Date(dueDate);
		}

		const chore = await Chore.create({
			title,
			description: description || "",
			householdCode,
			createdBy,
			assignedTo: assignedTo || "",
			dueDate: due,
			frequency: frequency || "once",
		});

		res.status(201).json(chore);
	} catch (err) {
		console.error("Create chore error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

// ---------- GET CHORES (all for a household) ----------
router.get("/", async (req, res) => {
	try {
		const { householdCode } = req.query;

		if (!householdCode) {
			return res.status(400).json({ message: "householdCode is required" });
		}

		const chores = await Chore.find({
			householdCode,
		}).sort({ dueDate: 1, createdAt: -1 });

		res.json(chores);
	} catch (err) {
		console.error("Get chores error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

// ---------- TOGGLE COMPLETE ----------
router.patch("/:id/complete", async (req, res) => {
	try {
		const { currentUser } = req.body; // e.g. email of logged-in user
		if (!currentUser) {
			return res.status(400).json({ message: "currentUser is required" });
		}

		const chore = await Chore.findById(req.params.id);
		if (!chore) {
			return res.status(404).json({ message: "Chore not found" });
		}

		const isAssignee = chore.assignedTo && chore.assignedTo === currentUser;
		const isCreator = chore.createdBy === currentUser;

		// only creator OR assignee is allowed
		if (!isCreator && !isAssignee) {
			return res.status(403).json({
				message: "Only the assignee or creator can mark this chore as done",
			});
		}

		const now = new Date();

		if (
			chore.frequency === "once" ||
			!chore.frequency ||
			chore.frequency === "once"
		) {
			// simple toggle for one-time chores
			chore.completed = !chore.completed;
			chore.completedAt = chore.completed ? now : null;
			chore.completedBy = chore.completed ? currentUser : null;
		} else {
			// recurring: record last completed and move dueDate to next occurrence
			chore.lastCompletedAt = now;
			chore.lastCompletedBy = currentUser;

			const next = new Date(chore.dueDate || now);

			if (chore.frequency === "daily") {
				next.setDate(next.getDate() + 1);
			} else if (chore.frequency === "weekly") {
				next.setDate(next.getDate() + 7);
			} else if (chore.frequency === "monthly") {
				next.setMonth(next.getMonth() + 1);
			}

			chore.dueDate = next;
		}

		await chore.save();
		res.json(chore);
	} catch (err) {
		console.error("Complete chore error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
