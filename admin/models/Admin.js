const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({
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
    password: {
        type: String,
        require: true,
    }
},
    { timestamps: true },
);

module.exports = mongoose.model("Admin", AdminSchema);