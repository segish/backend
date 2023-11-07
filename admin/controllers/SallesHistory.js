const sallsHistory = require("../models/SellsHistory")
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();

//get all histories
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access histories")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access histories")

        try {
            const histories = await sallsHistory.find();
            res.status(200).json(histories);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
const getAllbyDateQuantity = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access items!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access substores")
        try {
            const currentYear = new Date().getFullYear();

            const salleshistories = await sallsHistory.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                    },
                },
                {
                    $addFields: {
                        quantity: { $toInt: "$quantity" } // Convert the quantity field to an integer
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' }, // Group by month
                        count: { $sum: '$quantity' }, // Count the number of items
                    },
                },
                { $sort: { _id: 1 } }, // Sort by month
            ]);
            const line = [
                {
                    x: "Jan",
                    y: 0
                },
                {
                    x: "Feb",
                    y: 0
                },
                {
                    x: "Mar",
                    y: 0
                },
                {
                    x: "Apr",
                    y: 0
                },
                {
                    x: "May",
                    y: 0
                },
                {
                    x: "Jun",
                    y: 0
                },
                {
                    x: "Jul",
                    y: 0
                },
                {
                    x: "Aug",
                    y: 0
                },
                {
                    x: "Sep",
                    y: 0
                },
                {
                    x: "Oct",
                    y: 0
                },
                {
                    x: "Nov",
                    y: 0
                },
                {
                    x: "Dec",
                    y: 0
                },
            ];

            salleshistories?.forEach(item => {
                line[item._id - 1].y = item.count;
            });
            res.json(line);
        } catch (error) {
            res.status(500).json(error);
        }
    })
}
const getAllbyDateAmount = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access items!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access substores")
        try {
            const currentYear = new Date().getFullYear();

            const salleshistories = await sallsHistory.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                    },
                },
                {
                    $addFields: {
                        amount: { $toInt: "$amount" } // Convert the amount field to an integer
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' }, // Group by month
                        count: { $sum: '$amount' }, // Count the number of items
                    },
                },
                { $sort: { _id: 1 } }, // Sort by month
            ]);
            const line = [
                {
                    x: "Jan",
                    y: 0
                },
                {
                    x: "Feb",
                    y: 0
                },
                {
                    x: "Mar",
                    y: 0
                },
                {
                    x: "Apr",
                    y: 0
                },
                {
                    x: "May",
                    y: 0
                },
                {
                    x: "Jun",
                    y: 0
                },
                {
                    x: "Jul",
                    y: 0
                },
                {
                    x: "Aug",
                    y: 0
                },
                {
                    x: "Sep",
                    y: 0
                },
                {
                    x: "Oct",
                    y: 0
                },
                {
                    x: "Nov",
                    y: 0
                },
                {
                    x: "Dec",
                    y: 0
                },
            ];

            salleshistories?.forEach(item => {
                line[item._id - 1].y = item.count;
            });
            res.json(line);
        } catch (error) {
            res.status(500).json(error);
        }
    })
}
module.exports = { getAll, getAllbyDateAmount, getAllbyDateQuantity };


// const cron = require('node-cron');
// const Items = require('../models/Items');

// // Function to delete items older than one month
// const deleteItemsOlderThanOneMonth = async () => {
//     try {
//         const oneMonthAgo = new Date();
//         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//         await Items.deleteMany({ addedDate: { $lt: oneMonthAgo } });
//         console.log('Items older than one month have been deleted.');
//     } catch (err) {
//         console.error('Error while deleting old items:', err);
//     }
// };

// // Schedule the data cleanup function to run daily at midnight
// cron.schedule('0 0 * * *', deleteItemsOlderThanOneMonth);
