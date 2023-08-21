const User = require('../models/userModel');
const Products = require('../models/productModel')
const Addresses = require('../models/addressModel')
const Banners = require('../models/bannerModal')
const bcrypt = require('bcrypt')
const { sendVerifyMail } = require('../services/nodemailer')
const { getOTP, getReferralCode, securePassword } = require('../helpers/generator')
const { updateWallet } = require('../helpers/helpersFunctions')
require('dotenv').config()
const crypto = require('crypto')
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret:  process.env.KEY_SECRET,
});

const loadHome = async(req,res, next) => {
    try {
        const isLoggedIn = Boolean(req.session.userId)
        const banners = await Banners.find({})

        res.render('home',{page : 'Home', isLoggedIn, banners});
    } catch (error) {
        next(error);
    }
}

const loadLogin = async(req,res, next) => {
    try {
        res.render('login');
    } catch (error) {
        next(error);
    }
}

const logoutUser = async(req, res, next) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        next(error);
    }
}

const verifyLogin = async(req,res, next) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){

                if(!userData.isBlocked){
                    req.session.userId = userData._id
                    req.session.cartCount = userData.cart.length
                    req.session.wishCount = userData.wishlist.length
                    res.redirect('/')
                }else{
                    res.render('login',{message: 'Sorry:( You are blocked by admins'})
                    return;
                }
            }else{
                res.render('login',{message: 'Invalid Password'})
            }
        }else{
            res.render('login',{message: 'User does not exist'})
        }
        
    } catch (error) {
        next(error);
    }
}

const loadSignUp = async(req,res, next) => {
    try {
        const referral = req.query.referral
        res.render('signup', {referral})
    } catch (error) {
        next(error);
    }
}

////////////////////////////////////////////////////////////////////////////////
const saveAndLogin = async(req,res, next) => {
    try {
        const { fname, lname, email, mobile, password, confirmPassword, referral } = req.body;
        if(password === confirmPassword){

            const userData = await User.findOne({email})
            if(userData){
                return res.render('signup',{message : 'User Already Exists'})
            }

            const OTP = req.session.OTP = getOTP()
            
            sendVerifyMail(email, OTP); 

            setTimeout(() => {
                req.session.OTP = null; // Or delete req.session.otp;
            }, 600000); 

            res.render('otpValidation',{ fname, lname, email, mobile, password, referral, message : 'Check Spam mails' })

        }else{
            res.render('signup',{message : 'Password not matching'})
        }


    } catch (error) {
        next(error);
    }
}


const validateOTP = async(req,res, next) => { 
    try {
        const { fname, lname, email, mobile, password } = req.body

        const userOTP = req.body.OTP
        const referral = req.body.referral.trim()

        if(userOTP == req.session.OTP){
            const sPassword = await securePassword(password)
            const referralCode = await getReferralCode()


            let newUserData;
            if(referral){

                const isReferrerExist = await User.findOne({referralCode: referral})
                if(isReferrerExist){
                    let referrerId = isReferrerExist._id;

                    const walletHistory = {
                        date: new Date(),
                        amount: 100,
                        message: 'Joining Bonus'
                    }

                    newUserData = await new User({
                        fname, lname, email, mobile,
                        password:sPassword, referralCode,
                        referredBy: referral, wallet: 100,
                        walletHistory
                    }).save();
    
                    updateWallet(referrerId, 100, 'Refferal Reward')
                }

            }else{

                newUserData = await new User({
                    fname, lname, email, mobile,
                    password:sPassword, referralCode
                }).save();

            }

            req.session.userId = newUserData._id;

            res.redirect('/');
        }else{
            console.log('Incorrect OTP');
            res.render('otpValidation',{ fname, lname, email, mobile, password, referral, message : 'Incorrect OTP' })
        }
    } catch (error) {
        next(error);
    }
}

const resendOTP = async(req, res, next) => {
    try {
        console.log('in resend otp controller');
        const { email } = req.body
        const OTP = req.session.OTP = getOTP()
        console.log('resending otp '+OTP+' to '+email);
        setTimeout(() => {
            req.session.OTP = null; // Or delete req.session.otp;
            console.log('otp time out');
        }, 600000); 
        sendVerifyMail(email, OTP); 

        res.json({isResend: true})

    } catch (error) {
        next(error);
    }
}


const loadAboutUs = async(req,res, next) => {
    try {
        
        const isLoggedIn = Boolean(req.session.userId)

        res.render('aboutUs',{page : 'About Us',isLoggedIn})
    } catch (error) {
        next(error);
    }
}


const loadShoppingCart = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findById({_id:userId}).populate('cart.productId').populate('cart.productId.offer')
        const cartItems = userData.cart

        //Code to update cart values if product price changed by admin after we added pdt into cart
        for(const { productId } of cartItems ){
            await User.updateOne(
                { _id: userId, 'cart.productId': productId._id },
                {
                    $set: {
                        'cart.$.productPrice': productId.price,
                        'cart.$.discountPrice': productId.discountPrice
                    }
                }
            )
        }

        res.render('shoppingCart',{page: 'Shopping Cart', parentPage: 'Shop', isLoggedIn: true, userData, cartItems})
    } catch (error) {
        next(error); 
    }
}

const addToCart = async(req, res, next) => {
    try {
        const pdtId = req.params.id;
        const userId = req.session.userId;

        const userData = await User.findById({_id:userId})
        const pdtData = await Products.findById({_id: pdtId})
        
        if(pdtData.quantity){
            
            const isproductExist = userData.cart.findIndex((pdt) => pdt.productId == pdtId)
            if(isproductExist === -1){


                const cartItem = {
                    productId : pdtId,
                    quantity : 1,
                    productPrice : pdtData.price,
                    discountPrice : pdtData.discountPrice
                }
        
                await User.findByIdAndUpdate(
                    {_id: userId},
                    {
                        $push:{
                            cart: cartItem
                        }
                    }
                )
    
                req.session.cartCount++;

            }else{
                    
                await User.updateOne(
                    {_id: userId, 'cart.productId' : pdtId},
                    {
                        $inc:{
                            "cart.$.quantity":1
                        }
                    }
                );
    
                console.log('Product already exist on cart, quantity incremeted by 1');
            }

        }

        res.redirect('/shoppingCart')

    } catch (error) {
        next(error);
    }
}

const updateCart = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const quantity = parseInt(req.body.amt)
        const prodId = req.body.prodId

        const pdtData = await Products.findById({ _id: prodId })

        const stock = pdtData.quantity;
        let totalSingle
        if(pdtData.offerPrice){
            totalSingle = quantity*pdtData.offerPrice
        }else{
            totalSingle = quantity*(pdtData.price - pdtData.discountPrice)
        }

        if(stock >= quantity){
            await User.updateOne(
                { _id: userId, 'cart.productId' : prodId },
                {
                    $set: {
                        'cart.$.quantity' : quantity
                    }
                }
            );

            const userData =  await User.findById({_id: userId}).populate('cart.productId')
            let totalPrice = 0;
            let totalDiscount = 0;
            userData.cart.forEach(pdt => {

                totalPrice += pdt.productPrice*pdt.quantity
                if(pdt.productId.offerPrice){
                    totalDiscount += (pdt.productPrice - pdt.productId.offerPrice)*quantity
                }else{
                    totalDiscount += pdt.discountPrice*pdt.quantity
                }
            })

            res.json({
                status: true,
                data: { totalSingle, totalPrice, totalDiscount }
            })
        }else{
            res.json({
                status: false,
                data: 'Sorry the product stock has been exceeded'
            })
        }
    } catch (error) {
        next(error);
    }
}

const removeCartItem = async(req, res, next) => {
    try {
        
        const pdtId = req.params.id;
        const userId = req.session.userId;

        const userData = await User.findOneAndUpdate(
            {_id: userId, 'cart.productId': pdtId },
            {
                $pull: {
                    cart:{
                        productId : pdtId
                    } 
                }
            }
        );

        req.session.cartCount--;

        res.redirect('/shoppingCart');

    } catch (error) {
        next(error);
    }
}

const loadProfile = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findById({_id: userId})
        const userAddress = await Addresses.findOne({userId:userId})

        res.render('userProfile',{ userData, userAddress,isLoggedIn:true,page:'Profile'})
    } catch (error) {
        next(error);
    }
}


const loadEditProfile = async(req, res, next) => {
    try {
        id = req.session.userId;
        const userData = await User.findById({_id:id})
        res.render('editProfile',{userData})
    } catch (error) {
        next(error); 
    }
}

const postEditProfile = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const { fname, lname, mobile, dob } = req.body
        await User.findByIdAndUpdate(
            { _id: userId },
            {
                $set:{
                    fname, lname, mobile, dob
                }
            }
        );

        res.redirect('/profile');

    } catch (error) {
        next(error);
    }
}


const loadPassConfirmToChangeMail = async(req,res, next) => {
    try {
        res.render('passConfirmToChangeMail')
    } catch (error) {
        next(error);
    }
}

const postPassConfirmToChangeMail = async(req,res, next) => {
    try {
        const id = req.session.userId;
        const password = req.body.password
        const userData = await User.findById({ _id: id })
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            res.redirect('/profile/changeMail')
        }else{
            res.redirect('/profile/')
        }
    } catch (error) {
        next(error);
    }
}



const loadChangeMail = async(req,res, next) => {
    try {
        res.render('changeMail')
    } catch (error) {
        next(error);
    }
}

////////////////////////////////////////////////
const postChangeMail = async(req,res, next) => {
    try {

        const newMail = req.body.email

        const isMailExist = await User.findOne({email:newMail})

        if(isMailExist){
            console.log('Mail Already Exist');
            return
        }else{
            
            const OTP = req.session.OTP = getOTP()
            console.log('OTP generated when posted new email '+OTP);

            setTimeout(() => {
                req.session.OTP = null; // Or delete req.session.otp;
                console.log('otp time out');
            }, 600000); 

            sendVerifyMail(newMail, OTP); 
            req.session.newMail = newMail
            res.render('otpToChangeMail')
        }


    } catch (error) {
        next(error);
    }
}

const otpValidationToChangeMail = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const newMail = req.session.newMail;
        const OTP = req.body.OTP;
        const adminOTP = req.session.OTP

        if(OTP == adminOTP){

            await User.findByIdAndUpdate(
                {_id:userId},
                {
                    $set:{
                        email: newMail
                    }
                }
            );
            res.redirect('/profile')

        }else{
            console.log('OTP not correct');
        }
    } catch (error) {
        next(error);
    }
}

const loadChangePassword = async(req, res, next) => {
    try {
        console.log('loaded change password page');
        res.render('changePass')
    } catch (error) {
        next(error);
    }
}

const postChangePassword = async(req, res, next) => {
    try {
        console.log('posted change password');

        const userId = req.session.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if(newPassword !== confirmPassword){
            return res.redirect('/profile/changePassword')
        }

        const userData = await User.findById({ _id: userId });

        const passwordMatch = await bcrypt.compare(oldPassword, userData.password);
        if(passwordMatch){
            const sPassword = await securePassword(newPassword)
            await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $set:{
                        password:sPassword
                    }
                }
            );
            return res.redirect('/profile');
        }else{
            return res.redirect('/profile/changePassword');
        }
    } catch (error) {
        next(error);
    }
}


/////////////////////////////////////////////////////////
const forgotPassword = async(req, res, next) => {
    try {
        console.log('loaded forgot password');
        const userMail = await User.findById({_id: req.session.userId},{email:1,_id:0})
        const OTP = req.session.OTP = getOTP() 
        sendVerifyMail(userMail.email, OTP);
        setTimeout(() => {
            req.session.OTP = null; // Or delete req.session.otp;
            console.log('otp time out');
        }, 600000); 
        res.render('forgotPasswordVerification')

    } catch (error) {
        next(error);
    }
}

const verifyOTPforgotPass = async(req, res, next) => {
    try {
        const userOTP = req.body.OTP
        const adminOTP = req.session.OTP
        if(userOTP == adminOTP){
            res.render('resetPassword')
        }else{
            console.log('OTP not matching .... :(');
            res.redirect('/profile/forgotPassword')
        }
    } catch (error) {
        next(error);
    }
}

const loadResetPassword = async(req, res, next) => {
    try {
        res.render('resetPassword')
    } catch (error) {
        next(error);
    }
}

const postResetPassword = async(req, res, next) => {
    try {
        const { newPassword, confirmPassword} = req.body
        if(newPassword !== confirmPassword){
            return res.redirect('/profile/resetPassword');
        }else{
            const userId = req.session.userId;
            const sPassword = await securePassword(newPassword)
            await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $set:{
                        password:sPassword
                    }
                }
            );
            console.log('password updated');
            return res.redirect('/profile');
        }
    } catch (error) {
        next(error);
    }
}


const loadWalletHistory = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findById({_id: userId})
        const walletHistory = userData.walletHistory.reverse()
        res.render('walletHistory',{isLoggedIn:true, userData,walletHistory, page:'Profile'})
    } catch (error) {
        next(error)
    }
}

const addMoneyToWallet = async(req, res, next) => {
    try {
        console.log('adding money to wallet');
        const { amount } = req.body
        const  id = crypto.randomBytes(8).toString('hex')

        var options = {
            amount: amount*100,
            currency:'INR',
            receipt: "hello"+id
        }

        instance.orders.create(options, (err, order) => {
            if(err){
                res.json({status: false})
            }else{
                res.json({ status: true, payment:order })
            }

        })
    } catch (error) {
        next(error)
    }
}

const verifyWalletPayment = async(req, res, next) => {
    try {
        
        const userId = req.session.userId;
        const details = req.body
        const amount = parseInt(details['order[amount]'])/100
        let hmac = crypto.createHmac('sha256',process.env.KEY_SECRET)
        
        hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        if(hmac === details['response[razorpay_signature]']){
            console.log('order verified updating wallet');

            const walletHistory = {
                date: new Date(),
                amount,
                message: 'Deposited via Razorpay'
            }

            await User.findByIdAndUpdate(
                {_id: userId},
                {
                    $inc:{
                        wallet: amount
                    },
                    $push:{
                        walletHistory
                    }
                }
            );

            res.json({status: true})
        }else{
            res.json({status: false})
        }
    } catch (error) {
        next(next)
    }
}

const loadWishlist = async(req, res, next) => {
    try {
        console.log('loading wishlist');
        const userId = req.session.userId
        const isLoggedIn = Boolean(req.session.userId)
        const userData = await User.findById({_id:userId}).populate('wishlist')
        const wishlist = userData.wishlist
        res.render('wishlist',{page:'Wishlist', parentPage:'Shop', isLoggedIn, wishlist})
    } catch (error) {
        next(error)
    }
}

const addToWishlist = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session
        const userData = await User.findById({_id: userId});
        if(!userData.wishlist.includes(productId)){
            userData.wishlist.push(productId)
            await userData.save()
            req.session.wishCount++
        }
        let { returnPage } = req.query
        if(returnPage == 'shop'){
            res.redirect('/shop')
        }else if(returnPage == 'productOverview'){
            res.redirect(`/shop/productOverview/${productId}`)
        }
    } catch (error) {
        next(error)
    }
}

const removeWishlistItem = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session
        await User.findByIdAndUpdate(
            {_id: userId},
            {
                $pull:{
                    wishlist: productId
                }
            }
        );
        req.session.wishCount--
        const { returnPage } = req.query
        if(returnPage == 'shop'){
            res.redirect('/shop')
        }else if(returnPage == 'productOverview'){
            res.redirect(`/shop/productOverview/${productId}`)
        }else if(returnPage == 'wishlist'){
            res.redirect('/wishlist')
        }
    } catch (error) {
        next(error)
    }
}


module.exports = {
    loadHome,
    loadLogin,
    verifyLogin,
    loadSignUp,
    saveAndLogin,
    validateOTP,
    loadAboutUs,
    logoutUser,
    loadShoppingCart,
    addToCart,
    removeCartItem,
    loadProfile,
    loadEditProfile,
    postEditProfile,
    loadChangeMail,
    postChangeMail,
    loadChangePassword,
    postChangePassword,
    forgotPassword,
    loadPassConfirmToChangeMail,
    postPassConfirmToChangeMail,
    otpValidationToChangeMail,
    verifyOTPforgotPass,
    loadResetPassword,
    postResetPassword,
    resendOTP,
    updateCart,
    loadWalletHistory,
    addMoneyToWallet,
    verifyWalletPayment,
    loadWishlist,
    addToWishlist,
    removeWishlistItem

}