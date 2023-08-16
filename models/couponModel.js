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
    discountType:{
        type: String,
        enum: ['Percentage', 'Fixed Amount'],
        required: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    maxDiscountAmount:{
        type: Number,
        required: function(){
            return this.discountType === 'Percentage'
        }
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
        type: Array,
        ref: 'User',
        default: []
    },
    couponCount:{
        type:Number,
        default: Infinity
    }

},
{
    timestamps: true
})


couponSchema.pre('save', function(next) {
    if (typeof this.couponCount === undefined || this.couponCount == '') {
      this.couponCount = Infinity;
    }
    next();
});
  
couponSchema.pre('save', function(next) {
    if (typeof this.maxDiscountAmount === 'undefined' && this.discountType === 'Fixed Amount') {
      this.maxDiscountAmount = this.discountAmount
    }
    next();
});



couponSchema.statics.findByDiscountType = function (discountType){
    return this.find({discountType})
}

couponSchema.statics.findByIsCancelled = function (boolValue){
    return this.find({isCancelled: boolValue})
}

module.exports = mongoose.model('Coupons',couponSchema)