const jwt = require("jsonwebtoken");
const Items = require("../models/Items")
const MainStores = require("../models/MainStore")
const SubStores = require("../models/SubStore")
const Shops = require("../models/Shop")
const SallesPending = require("../models/SallesPending")
const History = require("../models/History")
const Pending = require("../models/Pending")
const SellsHistory = require("../models/SellsHistory")
const ToShopPending = require("../models/ToShopPending")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();
//add item

const addItem = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add items")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add items")
            const itemCode = req.body.itemCode
            const exists = await Items.findOne({ itemCode: itemCode })
            if (exists) return res.status(403).json("Item Code must be Unique!")
            if (!itemCode) return res.status(403).json("Item Code is required!")
            const newItme = new Items(req.body);
            //save and respond 
            const item = await newItme.save();
            res.status(200).json(item);
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//updat Item
const updateItem = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update items")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update items!")
        const tobeUpdated = req.params.id;
        const itemCode = req.body.initialItemcode;
        const exists = await Items.findOne({ itemCode: itemCode })
        if (exists && exists._id !== tobeUpdated) return res.status(403).json("Item Code must be Uniqueeee!")
        try {
            await Items.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            await MainStores.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await SubStores.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await Shops.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await SallesPending.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await History.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await Pending.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await SellsHistory.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            await ToShopPending.updateMany({ itemCode: itemCode }, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteItem = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete items!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete items!")
        const tobeDeleted = req.params.id
        try {
            const itemToDelete = await Items.findById(tobeDeleted)
            const itemCode = itemToDelete.itemCode;
            const inMainStore = await MainStores.find({ itemCode: itemCode })
            const inSubStores = await SubStores.find({ itemCode: itemCode })
            const inShops = await Shops.find({ itemCode: itemCode })
            const inSallesPending = await SallesPending.find({ itemCode: itemCode })
            const inPending = await Pending.find({ itemCode: itemCode })
            const inToShopPending = await ToShopPending.find({ itemCode: itemCode })
            if (inMainStore.length > 0) return res.status(409).json("can not DELETE! You have some of this item in main stores");
            if (inSubStores.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sub stores");
            if (inShops.length > 0) return res.status(409).json("can not DELETE! You have some of this item in shops");
            if (inSallesPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sales pending");
            if (inPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in Pending");
            if (inToShopPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in to shop pending");

            await Items.findByIdAndDelete(req.params.id);
            res.status(200).json("item has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all items
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access items")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access items")
        try {
            const items = await Items.find();
            res.status(200).json(items);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { addItem, deleteItem, getAll, updateItem };