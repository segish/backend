const jwt = require("jsonwebtoken");
const SellsHistory = require("../models/SellsHistory")
const Shops = require("../models/Shop")
const Credits = require("../models/Credit")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();
//add Shop

const addShop = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can add Shops");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can add Shops");

            const { itemCode, quantity, ...otherFields } = req.body;

            const existingItem = await Shops.findOne({ itemCode });

            if (existingItem) {
                existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                await existingItem.save();
                res.status(200).json(existingItem);
            } else {
                const newItem = new Shops(req.body);

                const savedItem = await newItem.save();
                res.status(200).json(savedItem);
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
}

//transaction
const transaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update Shops");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update Shops");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const amount = parseFloat(req.body.amount) * quantity;

            const item = await Shops.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity > currentQuantity) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");


            if (paymentMethod === "credit") {

                const phone = req.body.phone;
                const paymentDate = req.body.paymentDate;
                const cheque = req.body.cheque;

                const newCcredit = new Credits({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    expireDate: item.expireDate,
                    quantity: quantity,
                    warehouseType: "shop",
                    sellType: "retail",
                    customerName: customerName,
                    amount: amount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    paymentDate: paymentDate,
                    cheque: cheque,
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
                });
                await newHistoryItem.save();
            }
            if (quantity === currentQuantity) {
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

//updat Shop
const updateShop = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Shops")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Shops!")
        const tobeUpdated = req.params.id;
        try {
            const Shop = await Shops.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteShop = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Shops!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Shops!")
        try {
            await Shops.findByIdAndDelete(req.params.id);
            res.status(200).json("Shop has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Shops
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

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
module.exports = { addShop, deleteShop, getAll, updateShop, transaction };
