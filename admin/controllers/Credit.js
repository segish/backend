const jwt = require("jsonwebtoken");
const Credits = require("../models/Credit")
const SubStores = require("../models/SubStore")
const MainStores = require("../models/MainStore")
const Shops = require("../models/Shop")
const SellsHistory = require("../models/SellsHistory")
const Admin = require("../models/Admin")
const dotenv = require("dotenv");
dotenv.config();

// //cancele credite
// const canceleCredite = async (req, res) => {
//     const token = req.cookies.adminAccessToken;
//     if (!token) return res.status(401).json("You must login first!");

//     jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
//         if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

//         const currentUser = await Admin.findById(userInfo.id);
//         if (!currentUser) return res.status(403).json("only Admin can delete Pendings!")
//         if (currentUser.type != "admin") return res.status(403).json("only admin can delete Pendings!")
//         try {
//             const toBeDeleted = req.params.id;

//             const credite = await Credits.findById(toBeDeleted);
//             if (!credite) return res.status(404).json("item not found!");

//             if (credite.warehouseType === "mainstore") {
//                 const exists = await MainStores.findOne({
//                     itemCode: credite.itemCode,
//                     warehouseName: credite.warehouseName
//                 });
//                 if (exists) {
//                     exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(credite.quantity);
//                     await exists.save();
//                 } else {
//                     const newItem = new MainStores({
//                         name: credite.name,
//                         itemCode: credite.itemCode,
//                         specification: credite.specification,
//                         type: credite.type,
//                         warehouseName: credite.warehouseName,
//                         quantity: credite.quantity,
//                     });
//                     await newItem.save();
//                 }
//             } else if (credite.warehouseType === "subStore") {
//                 const exists = await SubStores.findOne({
//                     itemCode: credite.itemCode,
//                     warehouseName: credite.warehouseName
//                 });
//                 if (exists) {
//                     exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(credite.quantity);
//                     await exists.save();
//                 } else {
//                     const newItem = new SubStores({
//                         name: credite.name,
//                         itemCode: credite.itemCode,
//                         specification: credite.specification,
//                         type: credite.type,
//                         warehouseName: credite.warehouseName,
//                         quantity: credite.quantity,
//                     });
//                     await newItem.save();
//                 }
//             } else {
//                 const exists = await Shops.findOne({
//                     itemCode: credite.itemCode,
//                     warehouseName: credite.warehouseName
//                 });
//                 if (exists) {
//                     exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(credite.quantity);
//                     await exists.save();
//                 } else {
//                     const newItem = new Shops({
//                         name: credite.name,
//                         itemCode: credite.itemCode,
//                         specification: credite.specification,
//                         type: credite.type,
//                         warehouseName: credite.warehouseName,
//                         quantity: credite.quantity,
//                     });
//                     await newItem.save();
//                 }
//             }
//             await Credits.findByIdAndDelete(toBeDeleted);
//             res.status(200).json("Pending has been deleted");
//         } catch (err) {
//             return res.status(500).json("somthing went wrong!");
//         }
//     });
// }

//payed 
const ApproveCredit = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Admin can Approve Pendings")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Pendings!")
        try {
            const toBeDeleted = req.params.id;

            const credit = await Credits.findById(toBeDeleted);

            if (credit.creditType === "half") {
                const initialHistory = await SellsHistory.findById(toBeDeleted)
                initialHistory.amount = (parseInt(initialHistory.amount) || 0) + parseInt(credit.amount);
                await initialHistory.save();
            } else {
                const newHistory = new SellsHistory({
                    name: credit.name,
                    itemCode: credit.itemCode,
                    specification: credit.specification,
                    type: credit.type,
                    from: credit.warehouseName,
                    to: credit.customerName,
                    paymentMethod: "credit/paid",
                    quantity: credit.quantity,
                    amount: credit.amount,
                    sellType: credit.sellType,
                    warehouseType: credit.warehouseType,
                });
                await newHistory.save();
            }
            await Credits.findByIdAndDelete(toBeDeleted);
            res.status(200).json("Pending has been approved");

        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}

//updat Credit
const updateCredit = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Credits")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Credits!")
        const tobeUpdated = req.params.id;
        try {
            const Credit = await Credits.findByIdAndUpdate(tobeUpdated, {
                $set: req.body,
            })
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}

const deleteCredit = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete Credits!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Credits!")
        try {
            await Credits.findByIdAndDelete(req.params.id);
            res.status(200).json("Credit has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all Credits
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access Credits")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Credits")
        try {
            const Credit = await Credits.find();
            res.status(200).json(Credit);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { deleteCredit, getAll, updateCredit, ApproveCredit };