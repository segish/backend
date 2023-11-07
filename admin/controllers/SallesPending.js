const jwt = require("jsonwebtoken");
const SallesPending = require("../models/SallesPending")
const Admin = require("../models/Admin")
const Shops = require("../models/Shop")
const SubStores = require("../models/SubStore")
const Credits = require("../models/Credit")
const SellsHistory = require("../models/SellsHistory")
const dotenv = require("dotenv");
dotenv.config();

//delete pending
const deletePending = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Admin can delete Pendings!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Pendings!")
        try {
            const toBeDeleted = req.params.id;

            const pending = await SallesPending.findById(toBeDeleted);
            if (!pending) return res.status(404).json("item not found!");

            if (pending.warehouseType === "subStore") {
                const exists = await SubStores.findOne({
                    itemCode: pending.itemCode,
                    warehouseName: pending.from
                });
                if (exists) {
                    exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(pending.quantity);
                    await exists.save();
                } else {
                    const newItem = new SubStores({
                        name: pending.name,
                        itemCode: pending.itemCode,
                        specification: pending.specification,
                        type: pending.type,
                        expireDate: pending.expireDate,
                        warehouseName: pending.from,
                        quantity: pending.quantity,
                    });
                    await newItem.save();
                }
            } else {
                const exists = await Shops.findOne({
                    itemCode: pending.itemCode,
                    warehouseName: pending.from
                });
                if (exists) {
                    exists.quantity = (parseInt(exists.quantity) || 0) + parseInt(pending.quantity);
                    await exists.save();
                } else {
                    const newItem = new Shops({
                        name: pending.name,
                        itemCode: pending.itemCode,
                        specification: pending.specification,
                        type: pending.type,
                        expireDate: pending.expireDate,
                        warehouseName: pending.from,
                        quantity: pending.quantity,
                    });
                    await newItem.save();
                }
            }
            await SallesPending.findByIdAndDelete(toBeDeleted);
            res.status(200).json("Pending has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//Approve 
const ApprovePending = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Admin can Approve Pendings")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete Pendings!")
        try {
            const toBeDeleted = req.params.id;

            const pending = await SallesPending.findById(toBeDeleted);
            if (!pending) res.status(404).json("pending not found!")
            if (pending.paymentMethod === "credit") {
                const newCredit = new Credits({
                    name: pending.name,
                    itemCode: pending.itemCode,
                    specification: pending.specification,
                    type: pending.type,
                    expireDate: pending.expireDate,
                    quantity: pending.quantity,
                    warehouseType: pending.warehouseType,
                    sellType: pending.sellType,
                    customerName: pending.to,
                    amount: pending.amount,
                    phone: pending.phone,
                    warehouseName: pending.from,
                    paymentDate: pending.paymentDate,
                    cheque: pending.cheque,
                });
                await newCredit.save();
            } else {
                const newHistory = new SellsHistory({
                    name: pending.name,
                    itemCode: pending.itemCode,
                    specification: pending.specification,
                    type: pending.type,
                    from: pending.from,
                    to: pending.to,
                    paymentMethod: pending.paymentMethod,
                    quantity: pending.quantity,
                    amount: pending.amount,
                    sellType: pending.sellType,
                    warehouseType: pending.warehouseType,
                });
                await newHistory.save();
            }
            await SallesPending.findByIdAndDelete(toBeDeleted);
            res.status(200).json("Pending has been approved");

        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}

//get all Pendings
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only Admin can access Pendings")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access Pendings!")
        try {
            const Pendings = await SallesPending.find();
            res.status(200).json(Pendings);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}
module.exports = { deletePending, getAll, ApprovePending };