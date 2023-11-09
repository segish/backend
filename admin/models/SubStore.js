const mongoose = require("mongoose")

const SubStoreSchema = new mongoose.Schema({
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
    pendingToshopQuantity: {
        type: String,
        default: "0",
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("SubStore", SubStoreSchema);