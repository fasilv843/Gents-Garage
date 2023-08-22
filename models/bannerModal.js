const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    heading:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    url:{
        type: String,
        default: "/shop ",
        required : true
    }
});

module.exports = mongoose.model('Banners',bannerSchema);