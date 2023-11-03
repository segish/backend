const jwt = require("jsonwebtoken");
const Specification = require("../models/Specifications")
const Admin = require("../models/Admin")
const SubStores = require("../models/SubStore")
const Shops = require("../models/Shop")
const MainStores = require("../models/MainStore")
const SallesPending = require("../models/SallesPending")
const History = require("../models/History")
const Item = require("../models/Items")
const Pending = require("../models/Pending")
const SellsHistory = require("../models/SellsHistory")
const ToShopPending = require("../models/ToShopPending")
const dotenv = require("dotenv");
dotenv.config();
//add item

const addSpecification = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add Specifications")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add Specifications")
            const newSpecification = new Specification(req.body);
            //save and respond 
            const specification = await newSpecification.save();
            res.status(200).json(specification);
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//update Specification
const updateSpecification = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Specifications")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Specifications!")
        const tobeUpdated = req.params.id;
        try {
            const initialSpecification = await Specification.findById(tobeUpdated)
            const initialValue = initialSpecification.specification;
            await Specification.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            await MainStores.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                }
            })
            await SubStores.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                }
            })
            await Shops.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await Item.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await SallesPending.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await History.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await Pending.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await SellsHistory.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            await ToShopPending.updateMany({ specification: initialValue }, {
                $set: {
                    specification: req.body.specification,
                },
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteSpecification = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Specifications!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Specifications!")
        const tobeDeleted = req.params.id
        try {
            const itemToDelete = await Specification.findById(tobeDeleted)
            const itemspecification = itemToDelete.specification;
            const inMainStore = await MainStores.find({ specification: { $regex: itemspecification } })
            const inSubStores = await SubStores.find({ specification: { $regex: itemspecification } })
            const inShops = await Shops.find({ specification: { $regex: itemspecification } })
            const inSallesPending = await SallesPending.find({ specification: { $regex: itemspecification } })
            const inPending = await Pending.find({ specification: { $regex: itemspecification } })
            const inToShopPending = await ToShopPending.find({ specification: { $regex: itemspecification } })
            if (inMainStore.length > 0) return res.status(409).json("can not DELETE! You have some of this item in main stores");
            if (inSubStores.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sub stores");
            if (inShops.length > 0) return res.status(409).json("can not DELETE! You have some of this item in shops");
            if (inSallesPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in sales pending");
            if (inPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in Pending");
            if (inToShopPending.length > 0) return res.status(409).json("can not DELETE! You have some of this item in to shop pending");

            await Specification.findByIdAndDelete(req.params.id);
            res.status(200).json("Specification has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Specifications
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Specifications")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Specifications")
        try {
            const Specifications = await Specification.find();
            res.status(200).json(Specifications);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { addSpecification, deleteSpecification, getAll, updateSpecification };