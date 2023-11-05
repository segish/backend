const jwt = require("jsonwebtoken");
const Type = require("../models/Type")
const SubStores = require("../models/SubStore")
const Shops = require("../models/Shop")
const MainStores = require("../models/MainStore")
const SallesPending = require("../models/SallesPending")
const History = require("../models/History")
const Item = require("../models/Items")
const Pending = require("../models/Pending")
const SellsHistory = require("../models/SellsHistory")
const ToShopPending = require("../models/ToShopPending")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();
//add item

const addType = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add Types")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add Types")
            if (await Type.findOne(req.body)) return res.status(409).json("Item type Should be unique!!");
            const newType = new Type(req.body);
            //save and respond 
            const type = await newType.save();
            res.status(200).json(type);
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//update Type
const updateType = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Types")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Types!")
        const tobeUpdated = req.params.id;
        try {
            const initialtype = await Type.findById(tobeUpdated)
            const initialValue = initialtype.type;
            await Type.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            await MainStores.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                }
            })
            await SubStores.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                }
            })
            await Shops.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await SallesPending.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await History.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await Item.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await Pending.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await SellsHistory.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            await ToShopPending.updateMany({ type: initialValue }, {
                $set: {
                    type: req.body.type,
                },
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteType = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Types!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Types!")
        const tobeDeleted = req.params.id
        try {
            const itemToDelete = await Type.findById(tobeDeleted)
            const itemType = itemToDelete.type;
            const inMainStore = await MainStores.find({ type: itemType })
            const inSubStores = await SubStores.find({ type: itemType })
            const inShops = await Shops.find({ type: itemType })
            const inSallesPending = await SallesPending.find({ type: itemType })
            const inPending = await Pending.find({ type: itemType })
            const inToShopPending = await ToShopPending.find({ type: itemType })
            if (inMainStore.length > 0) return res.status(409).json("can not DELETE! You have some of this item in main stores");
            if (inSubStores.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sub stores");
            if (inShops.length > 0) return res.status(409).json("can not DELETE! You have some of this item in shops");
            if (inSallesPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sales pending");
            if (inPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in Pending");
            if (inToShopPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in to shop pending");

            await Type.findByIdAndDelete(req.params.id);
            res.status(200).json("Type has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Types
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Types")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Types")

        try {
            const Types = await Type.find();
            res.status(200).json(Types);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { addType, deleteType, getAll, updateType };