const mongoose = require("mongoose")

const ShopSchema = new mongoose.Schema({
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
    warehouseName: {
        type: String,
    },
    quantity: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("Shop", ShopSchema);