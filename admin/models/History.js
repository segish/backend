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
},
    { timestamps: true },
);

module.exports = mongoose.model("History", HistorySchema);