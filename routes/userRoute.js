const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const productCtrl = require('../controllers/productCtrl')
const addressCtrl = require('../controllers/addressCtrl')
const orderCtrl = require('../controllers/orderCtrl')
const auth = require('../middleware/auth')

const user_route = express.Router()

user_route.use( async(req, res, next) => {
    res.locals.cartCount = req.session.cartCount
    next()
})

user_route.use('/',auth.isUserBlocked)


// HTTP Mehtods
user_route.get('/',auth.isUserBlocked,userCtrl.loadHome); 

user_route.get('/login',userCtrl.loadLogin);
user_route.post('/login',userCtrl.verifyLogin);
user_route.get('/logout',userCtrl.logoutUser);

user_route.get('/signup',userCtrl.loadSignUp);
user_route.post('/signup',userCtrl.saveAndLogin);

user_route.post('/validateOTP',userCtrl.validateOTP)

user_route.get('/shop',auth.isUserBlocked,productCtrl.loadShop)
user_route.get('/shop/productOverview/:id',auth.isUserBlocked,productCtrl.loadProductOverview);

user_route.get('/aboutUs',auth.isUserBlocked,userCtrl.loadAboutUs);

//Planned on next week
user_route.get('/shoppingCart',auth.isUserLoggedIn,userCtrl.loadShoppingCart)
user_route.get('/shop/addToCart/:id',auth.isUserLoggedIn,userCtrl.addToCart)
user_route.post('/shoppingCart/removeItem/:id',auth.isUserLoggedIn,userCtrl.removeCartItem)
user_route.put('/updateCart',auth.isUserLoggedIn,userCtrl.updateCart);
user_route.get('/shoppingCart/proceedToCheckout',auth.isUserLoggedIn,orderCtrl.loadCheckout)
user_route.post('/shoppingCart/placeOrder',auth.isUserLoggedIn,orderCtrl.placeOrder)
// user_route.get('/wishlist',productCtrl.loadWishlist)


user_route.get('/orderSuccess',auth.isUserLoggedIn,orderCtrl.loadOrderSuccess)
user_route.get('/orderFailed',auth.isUserLoggedIn,orderCtrl.loadOrderFailed)


user_route.get('/profile',auth.isUserLoggedIn,userCtrl.loadProfile)
user_route.get('/profile/edit',auth.isUserLoggedIn,userCtrl.loadEditProfile)
user_route.post('/profile/edit',auth.isUserLoggedIn,userCtrl.postEditProfile)

user_route.get('/profile/addAddress',auth.isUserLoggedIn,addressCtrl.loadAddAddress)
user_route.post('/profile/addAddress/:returnPage',auth.isUserLoggedIn,addressCtrl.postAddAddress)
user_route.get('/profile/editAddress/:id',auth.isUserLoggedIn,addressCtrl.loadEditAddress)
user_route.post('/profile/editAddress/:id',auth.isUserLoggedIn,addressCtrl.postEditAddress)
user_route.get('/profile/deleteAddress/:id',auth.isUserLoggedIn,addressCtrl.deleteAddress)

user_route.get('/profile/passConfirmToChangeMail',auth.isUserLoggedIn,userCtrl.loadPassConfirmToChangeMail)
user_route.post('/profile/passConfirmToChangeMail',auth.isUserLoggedIn,userCtrl.postPassConfirmToChangeMail)
user_route.get('/profile/changeMail',auth.isUserLoggedIn,userCtrl.loadChangeMail)
user_route.post('/profile/changeMail',auth.isUserLoggedIn,userCtrl.postChangeMail)
user_route.post('/profile/otpToChangeMail',auth.isUserLoggedIn,userCtrl.otpValidationToChangeMail)

user_route.get('/profile/changePassword',auth.isUserLoggedIn,userCtrl.loadChangePassword)
user_route.post('/profile/changePassword',auth.isUserLoggedIn,userCtrl.postChangePassword)

user_route.get('/profile/forgotPassword',auth.isUserLoggedIn,userCtrl.forgotPassword)
user_route.post('/profile/forgotPasswordVerification',auth.isUserLoggedIn,userCtrl.verifyOTPforgotPass)
user_route.get('/profile/resetPassword',auth.isUserLoggedIn,userCtrl.loadResetPassword)
user_route.post('/profile/resetPassword',auth.isUserLoggedIn,userCtrl.postResetPassword)


user_route.get('/profile/myOrders',auth.isUserLoggedIn,orderCtrl.loadMyOrders)
user_route.get('/viewOrderDetails/:orderId',auth.isUserLoggedIn,orderCtrl.loadViewOrderDetails)
user_route.get('/cancelOrder/:orderId',auth.isUserLoggedIn,orderCtrl.cancelOrderByUser)


module.exports = user_route;