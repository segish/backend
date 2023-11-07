const jwt = require("jsonwebtoken");
const SubStores = require("../models/SubStore")
const Cashier = require("../models/Cashier")
const SallesPending = require("../models/SallesPending")
const ToShopPending = require("../models/ToShopPending")
const dotenv = require("dotenv");
dotenv.config();

//transaction to shop
const transaction = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Cashier.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only Cashier can update SubStores");
            if (!currentUser.isSubstore) return res.status(403).json("You are not allowed");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const warehouseName = req.body.warehouseName;
            const item = await SubStores.findById(itemId);
            if (!item) {
                return res.status(404).json("Item not found");
            }
            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity > currentQuantity) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            const newItem = new ToShopPending({
                name: item.name,
                itemCode: item.itemCode,
                specification: item.specification,
                type: item.type,
                expireDate: item.expireDate,
                cashierName: currentUser.adminName,
                quantity: quantity,
                from: item.warehouseName,
                to: warehouseName,
            });
            await newItem.save();
            if (quantity === currentQuantity) {
                await SubStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has moved to pending waitin to be approved by admin");
            } else if (quantity < currentQuantity) {
                item.quantity = currentQuantity - quantity;
                await item.save();
                res.status(200).json("Item has moved to pending waitin to be approved by admin");
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//Hole sale
const HoleSall = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Cashier.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only Cashier can make hole sall from SubStores");

            if (!currentUser.isSubstore) return res.status(403).json("You are not allowed");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const amount = parseFloat(req.body.amount) * quantity;
            const paymentDate = req.body.paymentDate;
            const phone = req.body.phone;
            const cheque = req.body.cheque;

            const item = await SubStores.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }
            const currentQuantity = parseInt(item.quantity) || 0;

            if (quantity > currentQuantity) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");

            const newpendingItem = new SallesPending({
                name: item.name,
                itemCode: item.itemCode,
                specification: item.specification,
                type: item.type,
                expireDate: item.expireDate,
                from: item.warehouseName,
                to: customerName,
                cashierName: currentUser.adminName,
                quantity: quantity,
                paymentMethod: paymentMethod,
                warehouseType: "subStore",
                amount: amount,
                paymentDate: paymentDate,
                phone: phone,
                cheque: cheque || "____",
                sellType: "Hole",
            });
            await newpendingItem.save();
            if (quantity === currentQuantity) {
                await SubStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has moved to pending waiting to be approved by admin");
            } else if (quantity < currentQuantity) {
                item.quantity = currentQuantity - quantity;
                await item.save();
                res.status(200).json("Item has moved to pending waiting to be approved by admin");
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//get all SubStores
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Cashier can access SubStores")
        if (!currentUser.isSubstore) return res.status(403).json("You are not allowed");
        try {
            const subStore = await SubStores.find();
            res.status(200).json(subStore);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll, transaction, HoleSall };