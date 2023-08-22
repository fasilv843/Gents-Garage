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
        },    
        offerId:{
            type:String
        },
        status:{
            type: String,
            enum: ['Order Confirmed', 'Shipped', 
                    'Out For Delivery', 'Delivered',
                    'Cancelled', 'Cancelled By Admin',
                    'Pending Return Approval', 'Returned']
        }
    }],
    paymentMethod:{
        type : String,
        enum: [ 'COD', 'Razorpay', 'Wallet' ],
        required: true
    },
    status:{
        type: String,
        enum: ['Order Confirmed', 'Shipped', 
                'Out For Delivery', 'Delivered',
                'Cancelled', 'Cancelled By Admin',
                'Pending Return Approval', 'Returned'],
        required: true
    },
    couponCode:{
        type: String
    },
    couponDiscount:{
        type: String,
        required: function(){
            return this.couponCode !== ''
        }
    },
    couponDiscountType:{
        type: String,
        enum: ['Percentage', 'Fixed Amount'],
        required: function(){
            return this.couponCode !== ''
        }
    }

},
{
    timestamps:true,
})


module.exports = mongoose.model('Orders',orderSchema);