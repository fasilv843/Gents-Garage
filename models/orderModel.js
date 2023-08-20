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
    // date:{
    //     type: Date,
    //     required: true
    // },
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


// const updateOrderStatus = async function (next) {
//     try {
        
//         // const isProductStatusModified = this.products.some((pdt, i) => {
//         //     return this.isModified(`products.${i}.status`)
//         // })

//         console.log('isProductStatusModified : '+this.isModified('products'));

//         if(this.isModified('products')){
//             const statusCounts = await this.model('Orders').aggregate([
//                 { $match: { _id: this._id } },
//                 { $unwind: '$products' },
//                 {
//                     $group: {
//                         _id: '$products.status',
//                         count: { $sum: 1 },
//                     },
//                 },
//             ]);

//             console.log(statusCounts);

//             const isOrderConfirmedExists = statusCounts.some(status => status._id === 'Order Confirmed');
//             console.log('isorderconfiremd : '+isOrderConfirmedExists);
//             if(isOrderConfirmedExists){
//                 this.status = 'Order Confirmed'
//                 return
//             }
            
//             const isShippedExists = statusCounts.some(status => status._id === 'Shipped');
//             console.log('isShippedExists : '+isShippedExists);
//             if(isShippedExists){
//                 this.status = 'Shipped'
//                 await userDara.save()
//                 return
//             }
    
//             const isOutForDeliveryExists = statusCounts.some(status => status._id === 'Out For Delivery');
//             console.log('isout for delivereyExists : '+isOutForDeliveryExists);
    
//             if(isOutForDeliveryExists){
//                 this.status = 'Out For Delivery'
//                 return
//             }
    
//             const isDeliveredExists = statusCounts.some(status => status._id === 'Delivered');
    
//             if(isDeliveredExists){
//                 this.status = 'Delivered'
//                 return
//             }
    
//             const cancelledByUserCount = statusCounts.find((item) => item._id === 'Cancelled')?.count || 0;
//             const cancelledByAdminCount = statusCounts.find((item) => item._id === 'Cancelled By Admin')?.count || 0;
//             const cancelledCount = cancelledByUserCount + cancelledByAdminCount;
//             console.log('cancelled count : '+cancelledCount);
//             if(cancelledByUserCount === this.products.length || cancelledCount === this.products.length){
//                 this.status = 'Cancelled'
//                 return;
//             }
            
//             if(cancelledByAdminCount === this.products.length){
//                 this.status = 'Cancelled By Admin'
//                 return;
//             }
            
//             const returnApprovalCount = statusCounts.find((item) => item._id === 'Pending Return Approval')?.count || 0;
//             const returnedCount = statusCounts.find((item) => item._id === 'Retruned')?.count || 0;
    
//             if( cancelledCount + returnApprovalCount + returnedCount === this.products.length){
//                 this.status = 'Pending Return Approval'
//                 return;
//             }
    
//             if( cancelledCount + returnedCount === this.products.length){
//                 this.status = 'Returned'
//                 return;
//             }

//             console.log('oops there is an error, function returned anywhere, from orderModel')
//         }

//     } catch (error) {
//         next(error)
//     }
// }

// // orderSchema.post('save', updateOrderStatus )


module.exports = mongoose.model('Orders',orderSchema);