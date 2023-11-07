const router = require("express").Router();
const {
  getAll,
  makeExpense,
  expenseHistory,
} = require("../controllers/Expense.js");

router.get("/getall", getAll);
router.get("/getexpensehistory", expenseHistory);
router.post("/newexpense", makeExpense);

module.exports = router;
