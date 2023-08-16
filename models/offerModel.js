const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({

    name:{
        type: String,
        required : true
    },
    discount: {
        type : Number,
        required: true
    },
    startingDate: {
        type: Date
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    }
},
{
    timestamps: true
})

// offerSchema.post ??
// offerSchema.pre('save', function(next){
//     const currentDate = new Date();
//     if(this.expiryDate <= currentDate){
//       this.status = 'Expired';
//     }
//     next();
// });

module.exports = mongoose.model('Offers',offerSchema)