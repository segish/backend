const jwt = require("jsonwebtoken");
const Pending = require("../models/Pending")
const MainStores = require("../models/MainStore")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();
//add pending

const addPending = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add Pendings")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add Pendings")
            const newPending = new Pending(req.body);
            //save and respond 
            const pendings = await newPending.save();
            res.status(200).json(pendings);
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//update Pending
const updatePending = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Pendings")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Pendings!")
        const tobeUpdated = req.params.id;
        try {
            const pending = await Pending.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

//delete pending
const deletePending = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Pendings!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Pendings!")
        try {
            await Pending.findByIdAndDelete(req.params.id);
            res.status(200).json("Pending has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//approve pending
const approvePending = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can approve Pendings!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can approve Pendings!")
        try {
            const warehouseName = req.body.warehouseName;
            const pending = await Pending.findById(req.params.id);
            if (!pending) return res.status(401).json("item not found!");
            const exists = await MainStores.findOne({
                itemCode: pending.itemCode,
                warehouseName: warehouseName
            });
            if (exists) {
                exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(pending.quantity);
                await exists.save();
            } else {
                const newItem = new MainStores({
                    name: pending.name,
                    itemCode: pending.itemCode,
                    specification: pending.specification,
                    type: pending.type,
                    expireDate: pending.expireDate,
                    quantity: pending.quantity,
                    warehouseName: warehouseName,
                });
                await newItem.save();
            }
            await Pending.findByIdAndDelete(req.params.id);
            res.status(200).json("Pending has been approved");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Pendings
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Pendings")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Pendingssss")
        try {
            const Pendings = await Pending.find();
            res.status(200).json(Pendings);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { addPending, deletePending, getAll, updatePending, approvePending };