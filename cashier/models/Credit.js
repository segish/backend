const mongoose = require("mongoose")

const CreditSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    itemCode: {
        type: String,
    },
    specification: {
        type: String,
    },
    type: {
        type: String,
    },
    quantity: {
        type: String,
    },
    warehouseType: {
        type: String,
    },
    sellType: {
        type: String,
    },
    customerName: {
        type: String,
    },
    amount: {
        type: Number,
    },
    phone: {
        type: String,
    },
    warehouseName: {
        type: String,
    },
    creditedDate: {
        type: String,
    },
    cheque: {
        type: String,
    },
    creditType: {
        type: String,
        default: "full",
    },
    approvedByCashier: {
        type: Boolean,
        default: false,
    },
    isCreditAtPendingSale: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("Credits", CreditSchema);