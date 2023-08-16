const mongoose = require('mongoose')

const productsSchema = mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    },
    size: {
        type: Array,
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number
    },
    images: {
        type: Array,
        required: true
    },
    isListed: {
        type : Boolean,
        default: true
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers'
    },
    offerPrice: { type: Number },
    offerAppliedBy: { 
        type: String
    }
},
{
    timestamps:true,
})


module.exports = mongoose.model('Products',productsSchema)