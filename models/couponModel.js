const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({

    code: {
        type: String,
        required: true,
        unique : true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    minPurchase: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    usedUsers: {
        type: Array
    }

})

module.exports = mongoose.model('Coupons',couponSchema)