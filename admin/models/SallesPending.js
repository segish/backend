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
    halfPayMethod: {
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
    paidamount: {
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
    creditType: {
        type: String,
        default: "full",
    },
    cheque: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("SallesPending", SallesPendingSchema);
