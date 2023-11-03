const jwt = require("jsonwebtoken");
const Warehouse = require("../models/Warehouse")
const SubStores = require("../models/SubStore")
const Shops = require("../models/Shop")
const MainStores = require("../models/MainStore")
const SallesPending = require("../models/SallesPending")
const History = require("../models/History")
const SellsHistory = require("../models/SellsHistory")
const ToShopPending = require("../models/ToShopPending")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
const Pending = require("../models/Pending");
dotenv.config();
//add item

const addWarehouse = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add Warehouses")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add Warehouses")
            const newWarehouse = new Warehouse(req.body);
            //save and respond 
            const warehouse = await newWarehouse.save();
            res.status(200).json(warehouse);
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//update Warehouse
const updateWarehouse = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Warehouses")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Warehouses!")
        const tobeUpdated = req.params.id;
        try {
            const initialwarehouse = await Warehouse.findById(tobeUpdated)
            const initialValue = initialwarehouse.name;
            await Warehouse.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            await Admin.updateMany({ warehouseName: initialValue }, {
                $set: {
                    warehouseName: req.body.name,
                }
            })
            await MainStores.updateMany({ warehouseName: initialValue }, {
                $set: {
                    warehouseName: req.body.name,
                }
            })
            await SubStores.updateMany({ warehouseName: initialValue }, {
                $set: {
                    warehouseName: req.body.name,
                }
            })
            await Shops.updateMany({ warehouseName: initialValue }, {
                $set: {
                    warehouseName: req.body.name,
                },
            })
            await SallesPending.updateMany({ from: initialValue }, {
                $set: {
                    from: req.body.name,
                },
            })
            await History.updateMany({ from: initialValue }, {
                $set: {
                    from: req.body.name,
                },
            })
            await History.updateMany({ to: initialValue }, {
                $set: {
                    to: req.body.name,
                },
            })
            await SellsHistory.updateMany({ from: initialValue }, {
                $set: {
                    from: req.body.name,
                },
            })
            await ToShopPending.updateMany({ from: initialValue }, {
                $set: {
                    from: req.body.name,
                },
            })
            await ToShopPending.updateMany({ to: initialValue }, {
                $set: {
                    to: req.body.name,
                },
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteWarehouse = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Warehouses!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Warehouses!")
        const tobeDeleted = req.params.id
        try {
            const itemToDelete = await Warehouse.findById(tobeDeleted)
            const warehouseName = itemToDelete.name;
            const inMainStore = await MainStores.find({ warehouseName: warehouseName })
            const inSubStores = await SubStores.find({ warehouseName: warehouseName })
            const inShops = await Shops.find({ warehouseName: warehouseName })
            const inSallesPending = await SallesPending.find({ warehouseName: warehouseName })
            const inPending = await Pending.find({ warehouseName: warehouseName })
            const inToShopPending = await ToShopPending.find({ warehouseName: warehouseName })
            if (inMainStore.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");
            if (inSubStores.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");
            if (inShops.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");
            if (inSallesPending.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");
            if (inPending.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");
            if (inToShopPending.length > 0) return res.status(409).json("can not DELETE! You have some items in this warehouse");

            await Warehouse.findByIdAndDelete(req.params.id);
            res.status(200).json("Warehouse has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Warehouses
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Warehouses")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Warehouses!")
        try {
            const warehouses = await Warehouse.find();
            res.status(200).json(warehouses);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { addWarehouse, deleteWarehouse, getAll, updateWarehouse };