const mongoose = require("mongoose")

const PendingSchema = new mongoose.Schema({
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
    company: {
        type: String,
    },
    quantity: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("Pending", PendingSchema);