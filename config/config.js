require('dotenv').config()
const mongoose = require('mongoose')
const crypto = require('crypto')



let mongoConnect = () => mongoose.connect(process.env.MONGO_URL,console.log('Database Connected'));

const secretKey = crypto.randomBytes(32).toString('hex')



module.exports = {
    mongoConnect,
    secretKey
}