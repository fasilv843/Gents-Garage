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
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers',
    }
    // sizes : {
    //     type : []
    // }
},
{
    timestamps: true
});

module.exports = mongoose.model("Categories",categoySchema)
