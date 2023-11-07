const jwt = require("jsonwebtoken");
const Warehouse = require("../models/Warehouse")
const Cashiers = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

//get all Warehouses
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashiers.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can access Warehouses")
        try {
            const warehouses = await Warehouse.find();
            res.status(200).json(warehouses);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll };