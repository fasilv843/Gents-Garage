const mongoose = require('mongoose')

const categoySchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    image:{
        type : String,
        // required : true
    },
    isListed:{
        type: Boolean,
        default: true
    }
    // sizes : {
    //     type : []
    // }
});

module.exports = mongoose.model("Categories",categoySchema)
