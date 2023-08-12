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
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin',adminRoute);
app.use('/',userRoute);

app.set('views','./views/errors');


app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).render('500')
})


// Error handling middleware
app.use((req, res, next) => {
    res.status(404);
    res.render("404", { url: req.url });
});

app.listen(process.env.PORT, console.log("Server us running on "+process.env.SERVER));