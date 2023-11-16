const mongoose = require("mongoose")

const HistorySchema = new mongoose.Schema({
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
    quantity: {
        type: String,
    },
    warehouseType: {
        type: String,
    },
},
    { timestamps: true },
);
HistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
module.exports = mongoose.model("History", HistorySchema);