const mongoose = require("mongoose")

const ExpenseSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
    },
    cashierName: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);