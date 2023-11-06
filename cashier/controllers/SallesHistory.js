const sallsHistory = require("../models/SellsHistory")
const jwt = require("jsonwebtoken");
const Cashiers = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

//get all histories
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Cashiers.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can access histories")

        try {
            const shophistories = await sallsHistory.find({ from: currentUser.warehouseName });
            const substorehistories = currentUser.isSubstore ? await sallsHistory.find({ warehouseType: "subStore" }) : [];
            res.status(200).json(shophistories.concat(substorehistories));
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll };