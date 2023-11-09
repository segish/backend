const mongoose = require("mongoose")

const ToShopPendingSchema = new mongoose.Schema({
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
    from: {
        type: String,
    },
    to: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("ToShopPending", ToShopPendingSchema);