const mongoose = require("mongoose")

const TypeSchema = new mongoose.Schema({
    type: {
        type: String,
        require: true,
        unique: true,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Type", TypeSchema);