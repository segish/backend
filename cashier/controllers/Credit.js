const jwt = require("jsonwebtoken");
const Credits = require("../models/Credit")
const Cashier = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can access Credits")
        try {
            const shopCredit = await Credits.find({ warehouseName: currentUser.warehouseName });
            const substoreCredit = currentUser.isSubstore ? await Credits.find({ warehouseType: "subStore" }) : [];
            res.status(200).json(shopCredit.concat(substoreCredit));
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}

//aproving by cashier
const approveCredit = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can approve credits")

        const tobeUpdated = req.params.id;
        try {
            await Cashier.findByIdAndUpdate(tobeUpdated, {
                $set: { approvedByCashier: true },
            })
            res.status(200).json("approved!!");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}
module.exports = { getAll, approveCredit };