const express = require('express')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const path = require('path');
require('dotenv').config()
const session = require('express-session');
const config = require('./config/config')
const nocache = require('nocache')

const app = express()
config.mongoConnect()


app.set('view engine','ejs')

app.use(nocache())
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}))

app.use(express.json());
app.use(express.urlencoded({extended:false})); //use it before route, then we don't have to use it on router again

app.use(express.static(path.join(__dirname, 'public')))

app.use('/',userRoute);
app.use('/admin',adminRoute);


// next to show error
app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status || 404).render('errors/404')
})

// error page
app.use((req, res) => {
    const isLoggedIn = Boolean(req.session.userId)
    res.status(404).render('errors/404',{isLoggedIn})
})



app.listen(process.env.PORT, console.log("Server us running on "+process.env.SERVER));