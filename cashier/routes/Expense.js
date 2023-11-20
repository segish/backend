const router = require("express").Router();
const { getAll, makeExpense, expenseHistory, totalSaleAndExpense } = require("../controllers/Expense.js");

router.get("/getall", getAll);
router.get("/getexpensehistory", expenseHistory);
router.post("/total", totalSaleAndExpense);
router.post("/newexpense", makeExpense);

module.exports = router;
