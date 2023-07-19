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
    isListed:{
        type : Boolean,
        default: true
    }
})

// const producstSchema = new mongoose.Schema({
//     name:{
//         type: String,
//         required : true////
//     },
//     price:{
//         type: Number,
//         required : true///
//     },
//     quantity:{
//         type: Number,
//         default : 3
//     },
//     description:{
//         type: String,
//         required : true///
//     },
//     sizes:{
//         type: Array,
//         required : true
//     },
//     colors:{
//         type: Array,
//         required : true
//     }
    
// });


module.exports = mongoose.model('Product',productsSchema)