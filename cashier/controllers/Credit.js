const jwt = require("jsonwebtoken");
const Credits = require("../models/Credit")
const Cashier = require("../models/Cashier")
const SallesPending = require("../models/SallesPending")
const dotenv = require("dotenv");
dotenv.config();

const getAll = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can access Credits")
        try {
            const shopCredit = await Credits.find({ warehouseName: currentUser.warehouseName, approvedByCashier: false });
            const substoreCredit = currentUser.isSubstore ? await Credits.find({ warehouseType: "subStore", approvedByCashier: false }) : [];
            const creditAtPendingsaleShop = await SallesPending.find({ from: currentUser.warehouseName, paymentMethod: "credit", approvedByCashier: false });
            const creditAtPendingsaleSubstore = currentUser.isSubstore ? await SallesPending.find({ paymentMethod: "credit", warehouseType: "subStore", approvedByCashier: false }) : [];
            const halfCreditAtPendingsaleShop = await SallesPending.find({ from: currentUser.warehouseName, paymentMethod: "halfpaid", approvedByCashier: false });
            const halfCreditAtPendingsaleSubstore = currentUser.isSubstore ? await SallesPending.find({ paymentMethod: "halfpaid", warehouseType: "subStore", approvedByCashier: false }) : [];

            const mappedShopCredit = shopCredit.map(item => ({
                _id: item._id,
                customerName: item.customerName,
                amount: item.amount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.warehouseName,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));
            const mappedSubstoreCredit = substoreCredit.map(item => ({
                _id: item._id,
                customerName: item.customerName,
                amount: item.amount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.warehouseName,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));
            const mappedCreditAtPendingsaleShop = creditAtPendingsaleShop.map(item => ({
                _id: item._id,
                customerName: item.to,
                amount: item.amount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.from,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));
            const mappedCreditAtPendingsaleSubstore = creditAtPendingsaleSubstore.map(item => ({
                _id: item._id,
                customerName: item.to,
                amount: item.amount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.from,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));
            const mappedHalfCreditAtPendingsaleShop = halfCreditAtPendingsaleShop.map(item => ({
                _id: item._id,
                customerName: item.to,
                amount: item.amount - item.paidamount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.from,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));
            const mappedHalfCreditAtPendingsaleSubstore = halfCreditAtPendingsaleSubstore.map(item => ({
                _id: item._id,
                customerName: item.to,
                amount: item.amount - item.paidamount,
                itemCode: item.itemCode,
                phone: item.phone,
                warehouseName: item.from,
                creditedDate: item.creditedDate,
                cheque: item.cheque,
                isCreditAtPendingSale: item.isCreditAtPendingSale
            }));

            const unsortedCredit = mappedShopCredit.concat(mappedCreditAtPendingsaleShop).concat(mappedSubstoreCredit).concat(mappedCreditAtPendingsaleSubstore).concat(mappedHalfCreditAtPendingsaleShop).concat(mappedHalfCreditAtPendingsaleSubstore)
            const sortedCredit = unsortedCredit.sort((a, b) => a.creditedDate - b.creditedDate);
            res.status(200).json(sortedCredit);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}

//aproving by cashier
const approveCredit = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Some thing went wrong please Logout and Login again ");

        const currentUser = await Cashier.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only cashier can approve credits")

        try {
            const tobeUpdated = req.params.id;
            const isCreditAtPendingSale = req.body.isCreditAtPendingSale;
            if (isCreditAtPendingSale) {
                await SallesPending.findByIdAndUpdate(tobeUpdated, {
                    $set: { approvedByCashier: true },
                });
                res.status(200).json("approved!!");
            } else {
                await Credits.findByIdAndUpdate(tobeUpdated, {
                    $set: { approvedByCashier: true },
                });
                res.status(200).json("approved!!");
            }
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}
module.exports = { getAll, approveCredit };