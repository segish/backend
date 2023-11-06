const mongoose = require("mongoose")

const WarehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        require: true,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Warehouse", WarehouseSchema);