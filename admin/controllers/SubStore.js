const jwt = require("jsonwebtoken");
const SubStores = require("../models/SubStore")
const TransactionToShop = require("./TransactionToShop")
const Credits = require("../models/Credit")
const Admin = require("../models/Admin")
const SellsHistory = require("../models/SellsHistory")
const dotenv = require("dotenv");
dotenv.config();

//add SubStore

const addSubStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can add SubStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can add SubStores");

            const { itemCode, quantity, warehouseName, ...otherFields } = req.body;

            const existingItem = await SubStores.findOne({ itemCode, warehouseName });

            if (existingItem) {
                existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                await existingItem.save();
                res.status(200).json(existingItem);
            } else {
                const newItem = new SubStores(req.body);

                const savedItem = await newItem.save();
                res.status(200).json(savedItem);
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
}


//Hole sale
const HoleSall = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update SubStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update SubStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const amount = parseFloat(req.body.amount) * quantity;

            const item = await SubStores.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity > currentQuantity) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");

            if (paymentMethod === "credit") {

                const phone = req.body.phone;
                const paymentDate = req.body.paymentDate;
                const cheque = req.body.cheque||null;

                const newCcredit = new Credits({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    expireDate: item.expireDate,
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
            if (quantity === currentQuantity) {
                await SubStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has soled");
            } else if (quantity < currentQuantity) {
                item.quantity = currentQuantity - quantity;
                await item.save();
                res.status(200).json(item);
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//transaction main to main
const Subtransaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can make transaction");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can make transaction");

            const itemId = req.params.id;
            const warehouseName = req.body.warehouseName;
            const quantity = parseInt(req.body.quantity)

            const currentItem = await SubStores.findById(itemId);
            if (!currentItem) return res.status(404).json("Item not found");
            const existingItem = await SubStores.findOne({ itemCode: currentItem.itemCode, warehouseName });

            const currentQuantity = parseInt(currentItem.quantity) || 0;
            if (quantity === currentQuantity) {

                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                    await existingItem.save();
                } else {
                    const newItem = new SubStores({
                        name: currentItem.name,
                        itemCode: currentItem.itemCode,
                        specification: currentItem.specification,
                        type: currentItem.type,
                        expireDate: currentItem.expireDate,
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
                        expireDate: currentItem.expireDate,
                        warehouseName: warehouseName,
                        quantity: quantity,
                    });
                    await newItem.save();
                }
                currentItem.quantity = currentQuantity - quantity;
                await currentItem.save();
                res.status(200).json(currentItem);
            } else {
                res.status(400).json("Invalid quantity. Cannot remove more items than available.");
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
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update SubStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update SubStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const warehouseName = req.body.warehouseName;
            const item = await SubStores.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity === currentQuantity) {
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
            } else {
                res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//updat SubStore
const updateSubStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update SubStores")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update SubStores!")
        const tobeUpdated = req.params.id;
        try {
            const SubStore = await SubStores.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteSubStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete SubStores!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete SubStores!")
        try {
            await SubStores.findByIdAndDelete(req.params.id);
            res.status(200).json("SubStore has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all SubStores
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

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
module.exports = { addSubStore, deleteSubStore, getAll, updateSubStore, transaction, Subtransaction, HoleSall };
