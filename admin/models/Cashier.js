const mongoose = require("mongoose")

const CshierSchema = new mongoose.Schema({
    adminName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        require: true,
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

module.exports = mongoose.model("Cshier", CshierSchema);