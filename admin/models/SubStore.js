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

module.exports = mongoose.model("SubStore", SubStoreSchema);