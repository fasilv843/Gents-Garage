const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required : true
    },
    lname:{
        type:String,
        required : true
    },
    mobile:{
        type:Number,
        required : true
    },
    email:{
        type:String,
        required : true
    },
    dob:{
        type:Date,
        default: new Date('1990-01-01')
    },
    doj:{
        type:Date,
        default: Date.now()
    },
    password:{
        type:String,
        required : true
    },
    isBlocked:{
        type:Boolean,
        default : false
    }
})

module.exports = mongoose.model('User',userSchema);