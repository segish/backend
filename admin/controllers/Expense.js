const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");
const Admin = require("../models/Admin");
const SallesPending = require("../models/SallesPending");
const dotenv = require("dotenv");
dotenv.config();

//get not approved/pending
const getAll = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err)
      return res
        .status(403)
        .json("Some thing went wrong please Logout and Login again ");
    const currentUser = await Admin.findById(userInfo.id);
    if (!currentUser)
      return res.status(403).json("only Admin can access expenses");
    if (currentUser.type != "admin")
      return res.status(403).json("only admin can access expenses");
    try {
      const expenses = await Expense.find({ approved: false });
      res.status(200).json(expenses);
    } catch (err) {
      res.status(500).json("somthing went wrong!");
    }
  });
};

//get apprved/history
const expenseHistory = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err)
      return res
        .status(403)
        .json("Some thing went wrong please Logout and Login again ");
    const currentUser = await Admin.findById(userInfo.id);
    if (!currentUser)
      return res.status(403).json("only Admin can access expenses");
    if (currentUser.type != "admin")
      return res.status(403).json("only admin can access expenses");
    try {
      const expenses = await Expense.find({ approved: true });
      res.status(200).json(expenses);
    } catch (err) {
      res.status(500).json("somthing went wrong!");
    }
  });
};

//make expense by Admin
const approveExpenses = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");
    try {
        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Admin can aprove expenses");
        if (currentUser.type != "admin") return res.status(403).json("only admin can aprove expenses");
        const tobeApproved = req.params.id;
            await Expense.findByIdAndUpdate(tobeApproved, {
              $set: { approved: true },
            });
      res.status(200).json("expense has been apprved!!");
    } catch (err) {
      return res.status(500).json("somthing went wrong!");
    }
  });
};
module.exports = { getAll, approveExpenses, expenseHistory };
