const mongoose = require('mongoose')

const brandOfferSchema = mongoose.Schema({

    name:{
        type: String,
        required : true
    },
    brand:{
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true
    },
    discount: {
        type : Number,
        required: true
    },
    startingDate: {
        type: Date,
        default : new Date()
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Available','Starting Soon','Cancelled','Expired'],
        required: true
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('BrandOffers',brandOfferSchema )