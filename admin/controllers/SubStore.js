const jwt = require("jsonwebtoken");
const SubStores = require("../models/SubStore")
const TransactionToShop = require("./TransactionToShop")
const Credits = require("../models/Credit")
const Admin = require("../models/Admin")
const SellsHistory = require("../models/SellsHistory")
const dotenv = require("dotenv");
dotenv.config();

//Hole sale
const HoleSall = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update SubStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update SubStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const phone = req.body.phone;
            const amount = parseFloat(req.body.amount) * quantity;
            const item = await SubStores.findById(itemId);
            if (!amount || !quantity || !paymentMethod) return res.status(400).json("please enter all required inputs!");
            if ((paymentMethod === "halfpaid" || paymentMethod === "credit") && (!customerName || !phone)) return res.status(400).json("please enter customer name and phone number!");


            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            const pendingToshopQuantity = parseInt(item.pendingToshopQuantity) || 0;
            const pendingSaleQuantity = parseInt(item.pendingSaleQuantity) || 0;
            if (quantity > (currentQuantity - (pendingToshopQuantity + pendingSaleQuantity))) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            if (paymentMethod === "halfpaid") {

                const paymentDate = req.body.paymentDate;
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
                    sellType: "Hole",
                    warehouseType: "subStore"
                });
                const savedHistory = await newHistoryItem.save();

                const newCcredit = new Credits({
                    _id: savedHistory._id,
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    quantity: quantity,
                    warehouseType: "subStore",
                    sellType: "Hole",
                    customerName: customerName,
                    amount: amount - paidamount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    paymentDate: paymentDate,
                    cheque: cheque || "____",
                    creditType: "half"
                });
                await newCcredit.save();

            } else if (paymentMethod === "credit") {

                const phone = req.body.phone;
                const paymentDate = req.body.paymentDate;
                const cheque = req.body.cheque || null;

                const newCcredit = new Credits({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    quantity: quantity,
                    warehouseType: "subStore",
                    sellType: "Hole",
                    customerName: customerName,
                    amount: amount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    paymentDate: paymentDate,
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
                    amount: amount,
                    sellType: "Hole",
                    warehouseType: "subStore"
                });
                await newHistoryItem.save();
            }
            if (quantity === currentQuantity && pendingSaleQuantity === 0 && pendingToshopQuantity === 0) {
                await SubStores.findByIdAndDelete(itemId);
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

//transaction sub to sub
const Subtransaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can make transaction");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can make transaction");

            const itemId = req.params.id;
            const warehouseName = req.body.warehouseName;
            const quantity = parseInt(req.body.quantity)
            if (!quantity || !warehouseName) return res.status(400).json("please enter quantity and warehouse name!");

            const currentItem = await SubStores.findById(itemId);
            if (!currentItem) return res.status(404).json("Item not found");
            const existingItem = await SubStores.findOne({ itemCode: currentItem.itemCode, warehouseName });

            const currentQuantity = parseInt(currentItem.quantity) || 0;
            const pendingToshopQuantity = parseInt(item.pendingToshopQuantity) || 0;
            const pendingSaleQuantity = parseInt(item.pendingSaleQuantity) || 0;
            if (quantity > (currentQuantity - (pendingToshopQuantity + pendingSaleQuantity))) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            
            if (quantity === currentQuantity && pendingSaleQuantity === 0 && pendingToshopQuantity === 0) {

                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                    await existingItem.save();
                } else {
                    const newItem = new SubStores({
                        name: currentItem.name,
                        itemCode: currentItem.itemCode,
                        specification: currentItem.specification,
                        type: currentItem.type,
                        warehouseName: warehouseName,
                        quantity: quantity,
                    });
                    await newItem.save();
                }
                await SubStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has moved");
            } else if (quantity < currentQuantity) {
                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                    await existingItem.save();
                } else {
                    const newItem = new SubStores({
                        name: currentItem.name,
                        itemCode: currentItem.itemCode,
                        specification: currentItem.specification,
                        type: currentItem.type,
                        warehouseName: warehouseName,
                        quantity: quantity,
                    });
                    await newItem.save();
                }
                currentItem.quantity = currentQuantity - quantity;
                await currentItem.save();
                res.status(200).json(currentItem);
            } 
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//transaction to shop
const transaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update SubStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update SubStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const warehouseName = req.body.warehouseName;
            const item = await SubStores.findById(itemId);
            if (!quantity || !warehouseName) return res.status(400).json("please enter quantity and warehouse name!");

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            const pendingToshopQuantity = parseInt(item.pendingToshopQuantity) || 0;
            const pendingSaleQuantity = parseInt(item.pendingSaleQuantity) || 0;
            if (quantity > (currentQuantity - (pendingToshopQuantity + pendingSaleQuantity))) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");

            if (quantity === currentQuantity && pendingSaleQuantity === 0 && pendingToshopQuantity === 0) {
                if (TransactionToShop(quantity, item, warehouseName)) {
                    await SubStores.findByIdAndDelete(itemId);
                    res.status(200).json("Item has moved");
                } else {
                    res.status(500).json("Something went wrong!");
                }
            } else if (quantity < currentQuantity) {
                if (TransactionToShop(quantity, item, warehouseName)) {
                    item.quantity = currentQuantity - quantity;
                    await item.save();
                    res.status(200).json(item);
                } else {
                    res.status(500).json("Something went wrong!");
                }
            } 
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//get all SubStores
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access SubStores")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access SubStores")
        try {
            const subStore = await SubStores.find();
            res.status(200).json(subStore);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { getAll, transaction, Subtransaction, HoleSall };
