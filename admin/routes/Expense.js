const router = require("express").Router();
const {
  getAll,
  approveExpenses,
  expenseHistory,
} = require("../controllers/Expense.js");

router.get("/getall", getAll);
router.get("/getexpensehistory", expenseHistory);
router.post("/approve/:id", approveExpenses);

module.exports = router;
