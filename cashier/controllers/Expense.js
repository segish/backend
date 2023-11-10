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
      const cashPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
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
      const halfCashPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            paymentMethod: "halfpaid",
            halfPayMethod: "cash",
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

      const creditPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            paymentMethod: "credit",
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
      const TotalPartialPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            paymentMethod: "halfpaid",
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
      const transferPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            paymentMethod: { $regex: "transfer" }, 
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

      const halfTransferPipeline = [
        {
          $match: {
            from: currentUser.warehouseName,
            paymentMethod: "halfpaid",
            halfPayMethod: { $regex: "transfer" },
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
            warehouseName: currentUser.warehouseName,
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

      const cashResult = await SallesPending.aggregate(cashPipeline);
      const PartialCash = await SallesPending.aggregate(halfCashPipeline);
      const creditResult = await SallesPending.aggregate(creditPipeline);
      const totalPartialSale = await SallesPending.aggregate(TotalPartialPipeline);
      const transferTesult = await SallesPending.aggregate(transferPipeline);
      const halfTransfer = await SallesPending.aggregate(halfTransferPipeline);
      const expenseResult = await Expense.aggregate(expensePipeline);

      const totalSaleCash = cashResult.length > 0 ? cashResult[0].totalAmount : 0;
      const totalPartialCashSale = PartialCash.length > 0 ? PartialCash[0].totalAmount : 0;
      const totalSaleCredit = creditResult.length > 0 ? creditResult[0].totalAmount : 0;
      const netPartialSale = totalPartialSale.length > 0 ? totalPartialSale[0].totalAmount : 0;
      const totalSaleTransfer = transferTesult.length > 0 ? transferTesult[0].totalAmount : 0;
      const totalPartialTransfer = halfTransfer.length > 0 ? halfTransfer[0].totalAmount : 0;
      const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalAmount : 0;

      const totalResponse = {
        totalSale: totalSaleCash + totalPartialCashSale,
        totalSaleCredit: totalSaleCredit + netPartialSale - totalPartialCashSale - totalPartialTransfer,
        totalSaleTransfer: totalSaleTransfer + totalPartialTransfer,
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
        warehouseName: currentUser.warehouseName,
      });
      newExpense.save();
      res.status(200).json("expense added to expense pending!!");
    } catch (err) {
      return res.status(500).json("somthing went wrong!");
    }
  });
};
module.exports = { getAll, makeExpense, expenseHistory, totalSaleAndExpense };
