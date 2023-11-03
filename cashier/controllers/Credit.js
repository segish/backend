const jwt = require("jsonwebtoken");
const Credits = require("../models/Credit")
const Cashier = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can access Credits")
        try {
            const shopCredit = await Credits.find({warehouseName: currentUser.warehouseName});
            const substoreCredit = currentUser.isSubstore? await Credits.find({ warehouseType: "subStore" }):[];
            res.status(200).json(shopCredit.concat(substoreCredit));
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll };