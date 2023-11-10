const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
    },
    warehouseName: {
      type: String,
    },
    amount: {
      type: Number,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);