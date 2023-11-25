const jwt = require("jsonwebtoken");
const SellsHistory = require("../models/SellsHistory")
const Shops = require("../models/Shop")
const Credits = require("../models/Credit")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();

//transaction
const transaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update Shops");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update Shops");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const phone = req.body.phone;
            const amount = parseFloat(req.body.amount) * quantity;
            if (!amount || !quantity || !paymentMethod) return res.status(400).json("please enter all required inputs!");
            if ((paymentMethod === "halfpaid" || paymentMethod === "credit") && (!customerName || !phone)) return res.status(400).json("please enter customer's name and phone number!");

            const item = await Shops.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            const pendingSaleQuantity = parseInt(item.pendingSaleQuantity) || 0;
            if (quantity > (currentQuantity-pendingSaleQuantity)) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");


            if (paymentMethod === "halfpaid") {

                const cheque = req.body.cheque;
                const paidamount = parseFloat(req.body.paidamount);
                const halfPayMethod = req.body.halfPayMethod;
                if (!paidamount || !halfPayMethod) return res.status(400).json("please enter all required inputs!");
                if (paidamount >= amount) return res.status(400).json("paid amount must be less than total amount " + amount);
                const newHistoryItem = new SellsHistory({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    from: item.warehouseName,
                    to: customerName,
                    quantity: quantity,
                    paymentMethod: halfPayMethod,
                    amount: paidamount,
                    sellType: "retail",
                    warehouseType: "shop"
                });
                const savedHistory = await newHistoryItem.save();

                const newCcredit = new Credits({
                    _id: savedHistory._id,
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    quantity: quantity,
                    warehouseType: "shop",
                    sellType: "retail",
                    customerName: customerName,
                    amount: amount - paidamount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    creditedDate: this.createdAt,
                    cheque: cheque || "____",
                    creditType: "half"
                });
                await newCcredit.save();


            } else if (paymentMethod === "credit") {

                const phone = req.body.phone;
                const cheque = req.body.cheque;

                const newCcredit = new Credits({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    quantity: quantity,
                    warehouseType: "shop",
                    sellType: "retail",
                    customerName: customerName,
                    amount: amount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    creditedDate: this.createdAt,
                    cheque: cheque || "____",
                });
                await newCcredit.save();
            } else {
                const newHistoryItem = new SellsHistory({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    from: item.warehouseName,
                    to: customerName,
                    quantity: quantity,
                    paymentMethod: paymentMethod,
                    sellType: "retail",
                    amount: amount,
                    warehouseType: "shop"
                });
                await newHistoryItem.save();
            }
            if (quantity === currentQuantity && pendingSaleQuantity === 0) {
                await Shops.findByIdAndDelete(itemId);
                res.status(200).json("Item has soled");
            } else if (quantity < currentQuantity) {
                item.quantity = currentQuantity - quantity;
                await item.save();
                res.status(200).json("Item has soled");
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//get all Shops
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Shops")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Shops")
        try {
            const shops = await Shops.find();
            res.status(200).json(shops);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll, transaction };
