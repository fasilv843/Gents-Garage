const dotenv = require('dotenv').config()
const mongoose = require('mongoose')


let mongoConnect = () => mongoose.connect(process.env.MONGO_URL,console.log('Database Connected'));

const sessionSecret = process.env.SESSION_SECRET


module.exports = {
    mongoConnect,
    sessionSecret
}