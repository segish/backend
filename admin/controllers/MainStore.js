const jwt = require("jsonwebtoken");
const MainStores = require("../models/MainStore")
const Shops = require("../models/Shop")
const SubStores = require("../models/SubStore")
const Transaction = require("./Transaction")
const Credits = require("../models/Credit")
const SellsHistory = require("../models/SellsHistory")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();

//add MainStore

const addMainStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can add MainStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can add MainStores");

            const { itemCode, quantity, warehouseName, ...otherFields } = req.body;

            const existingItem = await MainStores.findOne({ itemCode, warehouseName });

            if (existingItem) {
                existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                await existingItem.save();
                res.status(200).json(existingItem);
            } else {
                const newItem = new MainStores(req.body);

                const savedItem = await newItem.save();
                res.status(200).json(savedItem);
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};

//Hole sale
const HoleSall = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update MainStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update MainStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const customerName = req.body.customerName;
            const paymentMethod = req.body.paymentMethod;
            const amount = parseFloat(req.body.amount) * quantity;
            const item = await MainStores.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity > currentQuantity) return res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            if (paymentMethod === "halfpaid") {

                const phone = req.body.phone;
                const paymentDate = req.body.paymentDate;
                const cheque = req.body.cheque;
                const paidamount = parseFloat(req.body.paidamount);
                const halfPayMethod = req.body.halfPayMethod;

                const newCcredit = new Credits({
                    name: item.name,
                    itemCode: item.itemCode,
                    specification: item.specification,
                    type: item.type,
                    expireDate: item.expireDate,
                    quantity: quantity,
                    warehouseType: "mainstore",
                    sellType: "Hole",
                    customerName: customerName,
                    amount: amount - paidamount,
                    phone: phone,
                    warehouseName: item.warehouseName,
                    paymentDate: paymentDate,
                    cheque: cheque || "____",
                    creditType: "half"
                });
                const savedCredit = await newCcredit.save();

                const newHistoryItem = new SellsHistory({
                    _id: savedCredit._id,
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
                    warehouseType: "mainstore"
                });
                await newHistoryItem.save();

            } else if (paymentMethod === "credit") {

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
                    warehouseType: "mainstore",
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
                    warehouseType: "mainstore"
                });
                await newHistoryItem.save();
            }

            if (quantity === currentQuantity) {
                await MainStores.findByIdAndDelete(itemId);
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

//transaction main to main
const Maintransaction = async (req, res) => {
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

            const currentItem = await MainStores.findById(itemId);
            if (!currentItem) return res.status(404).json("Item not found");
            const existingItem = await MainStores.findOne({ itemCode: currentItem.itemCode, warehouseName });

            const currentQuantity = parseInt(currentItem.quantity) || 0;
            if (quantity === currentQuantity) {

                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                    await existingItem.save();
                } else {
                    const newItem = new MainStores({
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
                await MainStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has moved");
            } else if (quantity < currentQuantity) {
                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
                    await existingItem.save();
                } else {
                    const newItem = new MainStores({
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

//transaction to sub store
const transaction = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must log in first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("Only admin can update MainStores");
            if (currentUser.type !== "admin") return res.status(403).json("Only admin can update MainStores");

            const itemId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const warehouseName = req.body.warehouseName;
            const item = await MainStores.findById(itemId);

            if (!item) {
                return res.status(404).json("Item not found");
            }

            const currentQuantity = parseInt(item.quantity) || 0;
            if (quantity === currentQuantity) {
                Transaction(quantity, item, warehouseName)
                await MainStores.findByIdAndDelete(itemId);
                res.status(200).json("Item has moved");
            } else if (quantity < currentQuantity) {
                Transaction(quantity, item, warehouseName)
                item.quantity = currentQuantity - quantity;
                await item.save();
                res.status(200).json(item);
            } else {
                res.status(400).json("Invalid quantity. Cannot remove more items than available.");
            }
        } catch (err) {
            res.status(500).json("Something went wrong!");
        }
    });
};


//updaet MainStore
const updateMainStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update MainStores")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update MainStores!")
        const tobeUpdated = req.params.id;
        try {
            const MainStore = await MainStores.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

//delete
const deleteMainStore = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete MainStores!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete MainStores!")
        try {
            await MainStores.findByIdAndDelete(req.params.id);
            res.status(200).json("MainStore has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all MainStores
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access MainStores")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access MainStores")
        try {
            const mainStores = await MainStores.find();
            res.status(200).json(mainStores);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
//for line graph
const getAllbyDate = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access items!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access MainStores")
        try {

            const totalMainstore = await MainStores.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: { $toInt: "$quantity" } }
                    },
                },
            ]);
            const totalSubstore = await SubStores.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: { $toInt: "$quantity" } }
                    },
                },
            ]);
            const totalShop = await Shops.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: { $toInt: "$quantity" } }
                    },
                },
            ]);
            const pie = [{
                id: "Main Store",
                label: "Main Store",
                value: totalMainstore[0].totalQuantity || 0,
                color: "hsl(242, 70%, 50%)"
            },
            {
                id: "Sub Store",
                label: "Sub Store",
                value: totalSubstore[0].totalQuantity || 0,
                color: "hsl(86, 70%, 50%)"
            }, {
                id: "Shop",
                label: "Shop",
                value: totalShop[0].totalQuantity || 0,
                color: "hsl(297, 70%, 50%)"
            },]

            res.status(200).json(pie);
        } catch (error) {
            res.status(500).json("some thing went wrong");
        }
    })
}

module.exports = { addMainStore, deleteMainStore, getAll, updateMainStore, transaction, Maintransaction, HoleSall, getAllbyDate };
