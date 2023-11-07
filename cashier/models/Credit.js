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
    expireDate: {
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
    paymentDate: {
        type: String,
    },
    cheque: {
        type: String,
    },
    approvedByCashier: {
        type: Boolean,
        default:false,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("Credits", CreditSchema);