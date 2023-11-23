const History = require("../models/History")
const jwt = require("jsonwebtoken");
const Cashier = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

//get all histories
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Types")
        if (!currentUser.isSubstore) return res.status(403).json("You are not allowed for this service")
        try {
            const substorehistories = currentUser.isSubstore ? await History.find({ warehouseType: "subStore" }) : [];
            const sortedHistory = substorehistories.sort((a, b) => a.createdAt - b.createdAt);
            res.status(200).json(sortedHistory);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll };
