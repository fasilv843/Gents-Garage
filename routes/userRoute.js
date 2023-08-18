const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const productCtrl = require('../controllers/productCtrl')
const addressCtrl = require('../controllers/addressCtrl')
const orderCtrl = require('../controllers/orderCtrl')
const couponCtrl = require('../controllers/couponCtrl')
const {isUserLoggedIn, isUserLoggedOut ,isUserBlocked} = require('../middleware/auth')

const user_route = express();

user_route.set('views','./views/user');


user_route.use( async(req, res, next) => {
    res.locals.cartCount = req.session.cartCount
    res.locals.wishCount = req.session.wishCount
    next()
})

user_route.use('/', isUserBlocked);


// HTTP Mehtods
user_route.get('/',userCtrl.loadHome); 

user_route.get('/login', isUserLoggedOut ,userCtrl.loadLogin);
user_route.post('/login', isUserLoggedOut,userCtrl.verifyLogin);

user_route.get('/signup', isUserLoggedOut,userCtrl.loadSignUp);
user_route.post('/signup', isUserLoggedOut,userCtrl.saveAndLogin);

user_route.post('/validateOTP', isUserLoggedOut,userCtrl.validateOTP)
user_route.post('/resendOTP',userCtrl.resendOTP)

user_route.get('/shop',productCtrl.loadShop)
user_route.get('/shop/productOverview/:id',productCtrl.loadProductOverview);
user_route.get('/aboutUs',userCtrl.loadAboutUs);
user_route.get('/allReviews/:productId',productCtrl.loadAllReviews)


//to check isUserLoggedIn after this route
user_route.use('/', isUserLoggedIn)


user_route.get('/addReview/:productId',productCtrl.loadAddReview)
user_route.post('/addReview/:productId',productCtrl.postAddReview)
user_route.get('/editReview/:productId',productCtrl.loadEditReview)
user_route.post('/editReview/:productId',productCtrl.postEditReview)


user_route.get('/logout', userCtrl.logoutUser);

//Planned on next week
user_route.get('/shoppingCart',userCtrl.loadShoppingCart)
user_route.get('/shop/addToCart/:id',userCtrl.addToCart)
user_route.post('/shoppingCart/removeItem/:id',userCtrl.removeCartItem)
user_route.put('/updateCart',userCtrl.updateCart);
user_route.get('/shoppingCart/proceedToCheckout',orderCtrl.loadCheckout)
user_route.post('/shoppingCart/placeOrder',orderCtrl.placeOrder)
user_route.get('/wishlist',userCtrl.loadWishlist)
user_route.get('/addToWishlist/:productId',userCtrl.addToWishlist)
user_route.get('/removeWishlistItem/:productId',userCtrl.removeWishlistItem)


user_route.get('/orderSuccess',orderCtrl.loadOrderSuccess)
user_route.post('/verifyPayment',orderCtrl.verifyPayment)


user_route.get('/profile',userCtrl.loadProfile)
user_route.get('/profile/edit',userCtrl.loadEditProfile)
user_route.post('/profile/edit',userCtrl.postEditProfile)

user_route.get('/profile/addAddress',addressCtrl.loadAddAddress)
user_route.post('/profile/addAddress/:returnPage',addressCtrl.postAddAddress)
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
user_route.post('/profile/addMoneyToWallet/',userCtrl.addMoneyToWallet)
user_route.get('/profile/walletHistory',userCtrl.loadWalletHistory)
user_route.post('/verifyWalletPayment',userCtrl.verifyWalletPayment)

user_route.get('/profile/myOrders',orderCtrl.loadMyOrders)
user_route.get('/viewOrderDetails/:orderId',orderCtrl.loadViewOrderDetails)
user_route.get('/cancelOrder/:orderId',orderCtrl.cancelOrder)
user_route.get('/cancelSinglePrdt/:orderId/:pdtId',orderCtrl.cancelSinglePdt)
user_route.get('/returnOrder/:orderId',orderCtrl.returnOrder)
user_route.get('/returnSinglePrdt/:orderId/:pdtId',orderCtrl.returnSinglePdt)
user_route.get('/downloadInvoice/:orderId',orderCtrl.loadInvoice)

user_route.post('/applyCoupon',couponCtrl.applyCoupon);
user_route.get('/removeCoupon',couponCtrl.removeCoupon)


module.exports = user_route;