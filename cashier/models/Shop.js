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
    warehouseName: {
        type: String,
    },
    quantity: {
        type: String,
    },
    pendingSaleQuantity: {
        type: String,
        default: "0",
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("Shop", ShopSchema);