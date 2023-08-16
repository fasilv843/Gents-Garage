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
    cart:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity:{
            type : Number,
            default: 1
        },
        productPrice:{
            type: Number,
            required : true
        },
        discountPrice:{
            type : Number,
            required : true
        }
    }],
    password:{
        type:String,
        required : true
    },
    isBlocked:{
        type:Boolean,
        default : false
    },
    wallet:{
        type : Number,
        default : 0
    },
    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }
    }],
    wishlist:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    referralCode:{
        type: String,
        required : true,
        unique : true
    },
    referredBy:{
        type: String,
        readOnly: true
    }
},
{
    timestamps:true,
})

module.exports = mongoose.model('User',userSchema);