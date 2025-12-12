// backend/src/models/Chore.js
const mongoose = require("mongoose");

const choreSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },

		// who this chore belongs to (household)
		householdCode: { type: String, required: true },

		// who created it
		createdBy: { type: String, required: true }, // email or name

		// assignee (can be empty = shared chore)
		assignedTo: { type: String, default: "" }, // email or name

		dueDate: { type: Date, required: true },

		// once / daily / weekly / monthly
		frequency: {
			type: String,
			enum: ["once", "daily", "weekly", "monthly"],
			default: "once",
		},

		// completion info (for one-time chores)
		completed: { type: Boolean, default: false },
		completedAt: { type: Date },
		completedBy: { type: String },

		// optional: track last done for recurring chores
		lastCompletedAt: { type: Date },
		lastCompletedBy: { type: String },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Chore", choreSchema);
