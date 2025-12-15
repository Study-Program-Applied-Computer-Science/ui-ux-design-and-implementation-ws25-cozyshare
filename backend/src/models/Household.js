const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		// unique invite code (e.g. EXNY2S)
		code: {
			type: String,
			required: true,
			unique: true,
		},
		householdCode: { type: String, required: true, unique: true },
		members: [{ type: String, required: true }],
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Household", householdSchema);
