const mongoose = require("mongoose")

const SallesPendingSchema = new mongoose.Schema({
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
    cashierName: {
        type: String,
    },
    quantity: {
        type: String,
    },
    warehouseType: {
        type: String,
    },
    paymentMethod: {
        type: String,
    },
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    amount: {
        type: Number,
    },
    paymentDate: {
        type: String,
    },
    phone: {
        type: String,
    },
    sellType: {
        type: String,
    },
    cheque: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("SallesPending", SallesPendingSchema);
