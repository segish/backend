const jwt = require("jsonwebtoken");
const SallesPending = require("../models/SallesPending")
const Shops = require("../models/Shop")
const Cashier = require("../models/Cashier")
const dotenv = require("dotenv");
dotenv.config();

const transaction = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Cashier.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only Cashier can update shop");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const amount = parseFloat(req.body.amount) * quantity;
            const phone = req.body.phone;
            const cheque = req.body.cheque;

            if (!amount || !quantity || !paymentMethod) return res.status(400).json("please enter all required inputs!");


            const item = await Shops.findById(itemId);

            if (!item) return res.status(404).json("Item not found");
            if (currentUser.warehouseName != item.warehouseName) return res.status(403).json("You are not allowed");

            const currentQuantity = parseInt(item.quantity) || 0;
            const pendingSaleQuantity = parseInt(item.pendingSaleQuantity) || 0;
            if (quantity > (currentQuantity - pendingSaleQuantity)) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");

            if (paymentMethod === "halfpaid") {

                const phone = req.body.phone;
                const cheque = req.body.cheque;
                const paidamount = parseFloat(req.body.paidamount);
                const halfPayMethod = req.body.halfPayMethod;
                if (!paidamount || !halfPayMethod) return res.status(400).json("please enter all required inputs!");
                if (paidamount >= amount) return res.status(400).json("paid amount must be less than total amount " + amount);

                const newpendingItem = new SallesPending({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    from: item.warehouseName,
                    cashierName: currentUser.adminName,
                    to: customerName,
                    quantity: quantity,
                    paymentMethod: paymentMethod,
                    halfPayMethod: halfPayMethod,
                    warehouseType: "shop",
                    amount: amount,
                    paidamount: paidamount,
                    phone: phone,
                    cheque: cheque || "____",
                    sellType: "retail",
                    approvedByCashier: false,
                    isCreditAtPendingSale: true,
                });
                await newpendingItem.save();

            }else if (paymentMethod === "cash/transfer") {
                
                const paidamount = parseFloat(req.body.paidamount);
                const halfPayMethod = req.body.halfPayMethod;
                if (!paidamount || !halfPayMethod) return res.status(400).json("please enter all required inputs!");
                if (paidamount >= amount) return res.status(400).json("amount in cash must be less than total amount " + amount);

                const newpendingItem = new SallesPending({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    from: item.warehouseName,
                    cashierName: currentUser.adminName,
                    to: customerName,
                    quantity: quantity,
                    paymentMethod: paymentMethod,
                    halfPayMethod: halfPayMethod,
                    warehouseType: "shop",
                    amount: amount,
                    paidamount: paidamount,//cash amount
                    sellType: "retail",
                    approvedByCashier: false,
                    isCreditAtPendingSale: true,
                });
                await newpendingItem.save();

            } else {
                const newpendingItem = new SallesPending({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    from: item.warehouseName,
                    cashierName: currentUser.adminName,
                    to: customerName,
                    quantity: quantity,
                    paymentMethod: paymentMethod,
                    warehouseType: "shop",
                    amount: amount,
                    phone: phone,
                    cheque: cheque || "____",
                    sellType: "retail",
                    approvedByCashier: false,
                    isCreditAtPendingSale: true,
                });
                await newpendingItem.save();
            }

            item.pendingSaleQuantity = pendingSaleQuantity + quantity;
            await item.save();
            res.status(200).json("Item has moved to pending waiting to be approved by admin");
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//get all Shops
const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Cashier can access Shops")
        try {
            const shops = await Shops.find({
                warehouseName: currentUser.warehouseName,
            });
            res.status(200).json(shops);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll, transaction };