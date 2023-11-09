const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");
const Cashier = require("../models/Cashier");
const SallesPending = require("../models/SallesPending");
const dotenv = require("dotenv");
dotenv.config();

//get not apprved
const getAll = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err)
      return res
        .status(403)
        .json("Some thing went wrong please Logout and Login again ");
    const currentUser = await Cashier.findById(userInfo.id);
    if (!currentUser)
      return res.status(403).json("only cashier can access expenses");
    try {
      const expenses = await Expense.find({
        approved: false,
        cashierName: currentUser.adminName,
      });
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
    const currentUser = await Cashier.findById(userInfo.id);
    if (!currentUser)
      return res.status(403).json("only cashier can access expenses");
    try {
      const expenses = await Expense.find({
        approved: true,
        cashierName: currentUser.adminName,
      });
      res.status(200).json(expenses);
    } catch (err) {
      res.status(500).json("somthing went wrong!");
    }
  });
};

//total sale and expense


const totalSaleAndExpense = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");
    try {
      const currentUser = await Cashier.findById(userInfo.id);
      if (!currentUser) return res.status(403).json("only cashier can access expenses");
      const today = new Date(); // Get the current date
      const pipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            cashierName: currentUser.adminName,
            paymentMethod: "cash",
            createdAt: {
              $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ];
      const halfpipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            cashierName: currentUser.adminName,
            paymentMethod: "halfpaid",
            halfPayMethod:"cash",
            createdAt: {
              $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$paidamount" },
          },
        },
      ];

      const expensePipeline = [
        {
          $match: {
            cashierName: currentUser.adminName,
            createdAt: {
              $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ];

      const result = await SallesPending.aggregate(pipeline);
      const resultPartial = await SallesPending.aggregate(halfpipeline);
      const expenseResult = await Expense.aggregate(expensePipeline);

      const totalSale = result.length > 0 ? result[0].totalAmount : 0;
      const totalPartialSale = resultPartial.length > 0 ? resultPartial[0].totalAmount : 0;
      const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalAmount : 0;
      
      const totalResponse = {
        totalSale: totalSale + totalPartialSale,
        totalExpense: totalExpense,
      }
      res.status(200).json(totalResponse)

    } catch (err) {
      res.status(500).json("somthing went wrong!");
    }
  });
};

//make expense by cashier
const makeExpense = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err)
      return res
        .status(403)
        .json("Some thing went wrong please Logout and Login again ");
    const today = new Date(); // Get the current date

    try {
      const currentUser = await Cashier.findById(userInfo.id);
      if (!currentUser)
        return res.status(403).json("only cashier can make expenses");

      const { reason, amount } = req.body;
      // const pipeline = [
      //   {
      //     $match: {
      //       from: currentUser.warehouseName,
      //       cashierName: currentUser.adminName,
      //       createdAt: {
      //         $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
      //         $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalAmount: { $sum: "$amount" },
      //     },
      //   },
      // ];
      // const halfpipeline = [
      //   {
      //     $match: {
      //       from: currentUser.warehouseName,
      //       cashierName: currentUser.adminName,
      //       paymentMethod: "halfpaid",
      //       halfPayMethod: "cash",
      //       createdAt: {
      //         $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
      //         $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalAmount: { $sum: "$paidamount" },
      //     },
      //   },
      // ];

      // const expensePipeline = [
      //   {
      //     $match: {
      //       cashierName: currentUser.adminName,
      //       createdAt: {
      //         $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
      //         $lt: new Date(today.setHours(23, 59, 59, 999)), // End of today
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalAmount: { $sum: "$amount" },
      //     },
      //   },
      // ];

      // const result = await SallesPending.aggregate(pipeline);
      // const resultPartial = await SallesPending.aggregate(halfpipeline);
      // const expenseResult = await Expense.aggregate(expensePipeline);
      // const totalSale = result.length > 0 ? result[0].totalAmount : 0;
      // const totalPartialSale = resultPartial.length > 0 ? resultPartial[0].totalAmount : 0;
      // const totalExpenseAmount = expenseResult.length > 0 ? expenseResult[0].totalAmount : 0;

      // if (result.length === 0 && resultPartial.length === 0)
      //   return res.status(403).json("you dont have any sales today to make expenses");
      // if ((totalSale + totalPartialSale - totalExpenseAmount) < amount)
      //   return res.status(403).json("you dont have enough sales today to make this expense");

      const newExpense = new Expense({
        reason: reason,
        amount: amount,
        approved: false,
        cashierName: currentUser.adminName,
      });
      newExpense.save();
      res.status(200).json("expense added to expense pending!!");
    } catch (err) {
      return res.status(500).json("somthing went wrong!");
    }
  });
};
module.exports = { getAll, makeExpense, expenseHistory, totalSaleAndExpense };
