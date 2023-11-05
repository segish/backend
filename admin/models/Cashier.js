const mongoose = require("mongoose")

const CashierSchema = new mongoose.Schema({
    adminName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    phone: {
        type: String,
        require: true,
        unique: true,
    },
    type: {
        type: String,
        require: true,
        default: "cashier",
    },
    warehouseName: {
        type: String,
    },
    isSubstore: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        require: true,
    }
},
    { timestamps: true },
);

module.exports = mongoose.model("Cashier", CashierSchema);