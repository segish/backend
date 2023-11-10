const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");
const Admin = require("../models/Admin");
const SallesPending = require("../models/SallesPending");
const dotenv = require("dotenv");
dotenv.config();

//get not approved/pending
const getAll = async (req, res) => {
  const token = req.cookies.adminAccessToken;
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
  const token = req.cookies.adminAccessToken;
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
  const token = req.cookies.adminAccessToken;
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

const totalSaleAndExpense = async (req, res) => {
  const token = req.cookies.adminAccessToken;
  if (!token) return res.status(401).json("You must login first!");

  jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");
    try {
      const currentUser = await Admin.findById(userInfo.id);
      if (!currentUser) return res.status(403).json("only cashier can access expenses");

      const { warehouseName } = req.body;
      const today = new Date(); // Get the current date
      const pipeline = [
        {
          $match: {
            from: warehouseName,
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
            from: warehouseName,
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
            from: warehouseName,
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
      const transferPipeline = [
        {
          $match: {
            from: warehouseName,
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

      const expensePipeline = [
        {
          $match: {
            warehouseName: warehouseName,
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

      const cashResult = await SallesPending.aggregate(pipeline);
      const creditResult = await SallesPending.aggregate(creditPipeline);
      const transferTesult = await SallesPending.aggregate(transferPipeline);
      const resultPartial = await SallesPending.aggregate(halfpipeline);
      const expenseResult = await Expense.aggregate(expensePipeline);

      const totalSaleCash = cashResult.length > 0 ? cashResult[0].totalAmount : 0;
      const totalSaleCredit = creditResult.length > 0 ? creditResult[0].totalAmount : 0;
      const totalSaleTransfer = transferTesult.length > 0 ? transferTesult[0].totalAmount : 0;
      const totalPartialSale = resultPartial.length > 0 ? resultPartial[0].totalAmount : 0;
      const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalAmount : 0;

      const totalResponse = {
        totalSale: totalSaleCash + totalPartialSale,
        totalSaleCredit: totalSaleCredit,
        totalSaleTransfer: totalSaleTransfer,
        totalExpense: totalExpense,
      }
      res.status(200).json(totalResponse)

    } catch (err) {
      res.status(500).json("somthing went wrong!");
    }
  });
};
module.exports = { getAll, approveExpenses, expenseHistory, totalSaleAndExpense };
