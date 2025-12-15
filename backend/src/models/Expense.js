// backend/src/models/Expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
	title: { type: String, required: true },
	amount: { type: Number, required: true },
	paidBy: { type: String, required: true },

	splitWith: [{ type: String, required: true }],
	perPerson: { type: Number, required: true },

	type: { type: String, default: "one-time" }, // "one-time" or "monthly"
	purchaseDate: { type: Date, required: true },
	dueDate: { type: Date },
	notes: String,

	householdCode: { type: String, required: true },

	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);
