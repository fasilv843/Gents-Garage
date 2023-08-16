const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const path = require('path');
const express = require('express')
const session = require('express-session');
const nocache = require('nocache')
const {mongoConnect, secretKey} = require('./config/config')
require('dotenv').config()
const { err404, err500 } = require('./middleware/errorHandler')

const app = express()
mongoConnect()

app.set('view engine','ejs')

app.use(nocache());

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } //30 days
}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin',adminRoute);
app.use('/',userRoute);

app.set('views','./views/errors');

app.use(err404)
app.use(err500)

app.listen(process.env.PORT, console.log("Server us running on "+process.env.SERVER));