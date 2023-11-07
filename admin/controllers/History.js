const History = require("../models/History")
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
        if (!currentUser) return res.status(403).json("only admin can access Types")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Types")

        try {
            const histories = await History.find();
            res.status(200).json(histories);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll };


// const cron = require('node-cron');
// const Items = require('../models/Items');

// // Function to delete items older than one month
// const deleteItemsOlderThanOneMonth = async () => {
//     try {
//         const oneMonthAgo = new Date();
//         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//         await Items.deleteMany({ addedDate: { $lt: oneMonthAgo } });
//     } catch (err) {
//         console.error('Error while deleting old items:', err);
//     }
// };

// // Schedule the data cleanup function to run daily at midnight
// cron.schedule('0 0 * * *', deleteItemsOlderThanOneMonth);
