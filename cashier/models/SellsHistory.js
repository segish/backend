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
    warehouseType: {
        type: String,
    },
},
    { timestamps: true },
);
SellsHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });//to be deleted after one year
module.exports = mongoose.model("SellsHistory", SellsHistorySchema);