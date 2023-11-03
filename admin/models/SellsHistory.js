const mongoose = require("mongoose")

const SellsHistorySchema = new mongoose.Schema({
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
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    paymentMethod: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    sellType: {
        type: String,
    },
},
    { timestamps: true },
);

module.exports = mongoose.model("SellsHistory", SellsHistorySchema);