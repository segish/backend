const jwt = require("jsonwebtoken");
const ToShopPending = require("../models/ToShopPending")
const Cashier = require("../models/Cashier")
const SubStores = require("../models/SubStore")
const dotenv = require("dotenv");
dotenv.config();

//delete pending
const deletePending = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Cashier can delete Pendings!")
        if (!currentUser.isSubstore) return res.status(403).json("You are not allowed");
        try {
            const toBeDeleted = req.params.id;

            const pending = await ToShopPending.findById(toBeDeleted);
            if (!pending) return res.status(401).json("item not found!");
            const exists = await SubStores.findOne({
                itemCode: pending.itemCode,
                warehouseName: pending.from
            });

            if (exists) {
                exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(pending.quantity);
                await exists.save();
                await ToShopPending.findByIdAndDelete(toBeDeleted);
                res.status(200).json("Pending has been deleted");
            } else {
                const newItem = new SubStores({
                    name: pending.name,
                    itemCode: pending.itemCode,
                    specification: pending.specification,
                    type: pending.type,
                    expireDate: pending.expireDate,
                    warehouseName: pending.from,
                    quantity: pending.quantity,
                });
                await newItem.save();
                await ToShopPending.findByIdAndDelete(toBeDeleted);
                res.status(200).json("Pending has been deleted");
            }
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Pendings
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Cashier can access Pendings")
        if (!currentUser.isSubstore) return res.status(403).json("You are not allowed");
        try {
            const Pendings = await ToShopPending.find({to:currentUser.warehouseName});
            res.status(200).json(Pendings);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { deletePending, getAll };