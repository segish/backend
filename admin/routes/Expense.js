const router = require("express").Router();
const { getAll, approveExpenses, expenseHistory, totalSaleAndExpense } = require("../controllers/Expense.js");

router.get("/getall", getAll);
router.get("/getexpensehistory", expenseHistory);
router.post("/total", totalSaleAndExpense);
router.post("/approve/:id", approveExpenses);

module.exports = router;
