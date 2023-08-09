const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const path = require('path');
const express = require('express')
const session = require('express-session');
const nocache = require('nocache')
const {mongoConnect, secretKey} = require('./config/config')
require('dotenv').config()

const app = express()
mongoConnect()

app.set('view engine','ejs')

app.use(nocache());

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:false})); //use it before route, then we don't have to use it on router again

app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin',adminRoute);
app.use('/',userRoute);

app.set('views','./views/errors');

// next to show error
// app.use((err, req, res, next) => {
//     console.log(err.message);
//     const isLoggedIn = Boolean(req.session.userId)
//     res.status(err.status || 404).render('404',{isLoggedIn,err})
// })

// error page
// app.use((req, res) => {
//     const isLoggedIn = Boolean(req.session.userId)
//     res.status(404).render('404',{isLoggedIn})
// })


app.listen(process.env.PORT, console.log("Server us running on "+process.env.SERVER));