const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const productCtrl = require('../controllers/productCtrl')
const addressCtrl = require('../controllers/addressCtrl')
const orderCtrl = require('../controllers/orderCtrl')
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

user_route.get('/aboutUs',userCtrl.loadAboutUs);

//Planned on next week
user_route.get('/shoppingCart',auth.isUserLoggedIn,userCtrl.loadShoppingCart)
user_route.get('/shop/addToCart/:id',auth.isUserLoggedIn,userCtrl.addToCart)
user_route.post('/shoppingCart/removeItem/:id',auth.isUserLoggedIn,userCtrl.removeCartItem)
user_route.put('/updateCart',userCtrl.updateCart);
user_route.get('/shoppingCart/proceedToCheckout',orderCtrl.loadCheckout)
user_route.post('/shoppingCart/placeOrder',orderCtrl.placeOrder)
// user_route.get('/wishlist',productCtrl.loadWishlist)


user_route.get('/orderSuccess',orderCtrl.loadOrderSuccess)
user_route.get('/orderFailed',orderCtrl.loadOrderFailed)


user_route.get('/profile',userCtrl.loadProfile)
user_route.get('/profile/edit',userCtrl.loadEditProfile)
user_route.post('/profile/edit',userCtrl.postEditProfile)

user_route.get('/profile/addAddress',addressCtrl.loadAddAddress)
user_route.post('/profile/addAddress',addressCtrl.postAddAddress)
user_route.get('/profile/editAddress/:id',addressCtrl.loadEditAddress)
user_route.post('/profile/editAddress/:id',addressCtrl.postEditAddress)
user_route.get('/profile/deleteAddress/:id',addressCtrl.deleteAddress)

user_route.get('/profile/passConfirmToChangeMail',userCtrl.loadPassConfirmToChangeMail)
user_route.post('/profile/passConfirmToChangeMail',userCtrl.postPassConfirmToChangeMail)
user_route.get('/profile/changeMail',userCtrl.loadChangeMail)
user_route.post('/profile/changeMail',userCtrl.postChangeMail)
user_route.post('/profile/otpToChangeMail',userCtrl.otpValidationToChangeMail)

user_route.get('/profile/changePassword',userCtrl.loadChangePassword)
user_route.post('/profile/changePassword',userCtrl.postChangePassword)

user_route.get('/profile/forgotPassword',userCtrl.forgotPassword)
user_route.post('/profile/forgotPasswordVerification',userCtrl.verifyOTPforgotPass)
user_route.get('/profile/resetPassword',userCtrl.loadResetPassword)
user_route.post('/profile/resetPassword',userCtrl.postResetPassword)

module.exports = user_route;