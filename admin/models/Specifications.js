const mongoose= require("mongoose")

const SpecificationSchema = new mongoose.Schema({
    specification:{
        type:String,
        require:true,
    },
    type:{
        type:String,
        require:true,
    },
},
    {timestamps:true}
    );

module.exports = mongoose.model("Specification", SpecificationSchema);