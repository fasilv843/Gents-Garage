const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const productCtrl = require('../controllers/productCtrl')
const auth = require('../middleware/auth')

const user_route = express.Router()


// HTTP Mehtods
user_route.get('/',userCtrl.loadHome); 

user_route.get('/login',userCtrl.loadLogin);
user_route.post('/login',userCtrl.verifyLogin);
user_route.get('/logout',userCtrl.logoutUser);

user_route.get('/signup',userCtrl.loadSignUp);
user_route.post('/signup',userCtrl.saveAndLogin);

user_route.post('/validateOTP',userCtrl.validateOTP)

user_route.get('/shop',productCtrl.loadShop)
user_route.get('/shop/productOverview/:id',productCtrl.loadProductOverview)

user_route.get('/aboutUs',userCtrl.loadAboutUs)

//Planned on next week
// user_route.get('/shoppingCart',productCtrl.loadShoppingCart)
// user_route.get('/wishlist',productCtrl.loadWishlist)
// user_route.get('/profile',userCtrl.loadProfile)


module.exports = user_route;