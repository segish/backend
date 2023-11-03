const mongoose= require("mongoose")

const ItemSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    type:{
        type:String,
    },
    itemCode:{
        type: String,
        unique: true,
        require: true,
    },
    specification:{
        type:String,
    },
},
{timestamps: true},
);

module.exports = mongoose.model("Item",ItemSchema);