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
    reviews:[{
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        title:{
            type: String
        },
        description:{
            type: String
        },
        rating:{
            type: Number
        },
        createdAt:{
            type: Date
        }
    }],
    totalRating:{
        type: Number,
        default: 0
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


// Shared function to calculate and update totalRating
// const updateTotalRating = async function () {
//     const docToUpdate = await this.model.findOne(this.getQuery());

//     if (docToUpdate) {
//         const reviews = docToUpdate.reviews || [];
//         const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;

//         await this.updateOne({ totalRating });
//     }
// };

// Use pre hooks for different update methods and call the shared function
// productsSchema.pre('updateOne', updateTotalRating);
// productsSchema.pre('findByIdAndUpdate', updateTotalRating);
// productsSchema.pre('findOneAndUpdate', updateTotalRating);
// Add more update methods if needed


module.exports = mongoose.model('Products',productsSchema)