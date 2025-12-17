const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
	{
		householdCode: { type: String, required: true, index: true },
		from: { type: String, required: true }, // debtor
		to: { type: String, required: true }, // creditor
		amount: { type: Number, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);
