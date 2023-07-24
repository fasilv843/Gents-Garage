const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveryAddress:{
        type: Object,
        required: true
    },
    totalPrice:{
        type: Number,
        required: true
    },
    products:[{
        productId:{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        productName:{
            type:String,
            required: true
        },
        productPrice:{
            type:Number,
            required:true
        },
        discountPrice:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:String,
            required:true
        },
        totalDiscount:{
            type:String,
            required:true
        }
    }],
    paymentMehod:{
        type : String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Orders',orderSchema);