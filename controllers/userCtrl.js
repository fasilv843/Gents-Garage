const User = require('../models/userModel');
const Products = require('../models/productModel')
const Addresses = require('../models/addressModel')
const Banners = require('../models/bannerModal')
const bcrypt = require('bcrypt')
const { sendVerifyMail } = require('../services/nodemailer')
const { getOTP, getReferralCode, securePassword } = require('../helpers/generator')
require('dotenv').config()


const loadHome = async(req,res) => {
    try {
        const isLoggedIn = Boolean(req.session.userId)
        const banners = await Banners.find({})

        res.render('home',{page : 'Home', isLoggedIn, banners});
    } catch (error) {
        console.log(error)
    }
}

const loadLogin = async(req,res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
}

const logoutUser = async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log();
    }
}

const verifyLogin = async(req,res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){

                if(!userData.isBlocked){
                    req.session.userId = userData._id
                    req.session.cartCount = userData.cart.length
                    res.redirect('/')
                }else{
                    console.log('Sorry:( You are blocked by admins');
                    res.render('login',{message: 'Sorry:( You are blocked by admins'})
                    return;
                }
            }else{
                console.log('Invalid Password');
                res.render('login',{message: 'Invalid Password'})
            }
        }else{
            console.log('User does not exist');
            res.render('login',{message: 'User does not exist'})
        }
        
    } catch (error) {
        console.log(error);
    }
}

const loadSignUp = async(req,res) => {
    try {
        const referral = req.query.referral
        res.render('signup', {referral})
    } catch (error) {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////////////////////////
const saveAndLogin = async(req,res) => {
    try {
        const { fname, lname, email, mobile, password, confirmPassword, referral } = req.body;
        if(password === confirmPassword){

            const userData = await User.findOne({email})
            if(userData){
                console.log('User Already Exists');
                return res.render('signup',{message : 'User Already Exists'})
            }

            const OTP = req.session.OTP = getOTP()
            
            sendVerifyMail(email, OTP); 
            res.render('otpValidation',{ fname, lname, email, mobile, password, referral, message : 'Check Spam mails' })

        }else{
            console.log('password not matching');
            res.render('signup',{message : 'Password not matching'})
        }


    } catch (error) {
        console.log(error);
    }
}


const validateOTP = async(req,res) => { 
    try {
        const { fname, lname, email, mobile, password } = req.body

        const userOTP = req.body.OTP
        const referral = req.body.referral.trim()

        console.log('referral : '+referral);
        // console.log('req.session.OTP : '+req.session.OTP+" "+ typeof req.session.OTP);
        // console.log('userOTP : '+userOTP+" "+ typeof userOTP);
        
        if(userOTP == req.session.OTP){
            console.log('OTP Validated Successfully!')
            const sPassword = await securePassword(password)
            const referralCode = getReferralCode()

            let newUserData;
            if(referral){

                const isReferrerExist = await User.findOne({referralCode: referral})

                if(isReferrerExist){

                    let referrerId = isReferrerExist._id;

                    newUserData = await new User({
                        fname, lname, email, mobile,
                        password:sPassword, referralCode,
                        referredBy: referral, wallet: 100
                    }).save();
    
                    await User.findByIdAndUpdate(
                        {_id: referrerId},
                        {
                            $inc:{
                                wallet : 100
                            }
                        }
                    )
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
        console.log(error);
    }
}

const resendOTP = async(req, res, next) => {
    try {
        console.log('in resend otp controller');
        const { email } = req.body
        const OTP = req.session.OTP = getOTP()
        console.log('resending otp '+OTP+' to '+email);
        sendVerifyMail(email, OTP); 

        res.json({isResend: true})

    } catch (error) {
        next(error)
    }
}


const loadAboutUs = async(req,res) => {
    try {
        
        const isLoggedIn = Boolean(req.session.userId)

        res.render('aboutUs',{page : 'About Us',isLoggedIn})
    } catch (error) {
        console.log(error);
    }
}


const loadShoppingCart = async(req, res ) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findById({_id:userId}).populate('cart.productId').populate('cart.productId.offer')
         const cartItems = userData.cart
        console.log(cartItems[0].productId);
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
        console.log(error); 
    }
}

const addToCart = async(req, res) => {
    try {
        const pdtId = req.params.id;
        const userId = req.session.userId;

        const userData = await User.findById({_id:userId})

        const isproductExist = await userData.cart.findIndex((pdt) => pdt.productId == pdtId)
        console.log('isproductExist : '+isproductExist);

        if(isproductExist === -1){

            const pdtData = await Products.findById({_id: pdtId})

            const cartItem = {
                productId : pdtId,
                quantity : 1,
                productPrice : pdtData.price,
                discountPrice : pdtData.discountPrice
            }
    
            const userData = await User.findByIdAndUpdate(
                {_id: userId},
                {
                    $push:{
                        cart: cartItem
                    }
                }
            )

            req.session.cartCount++;

            res.redirect('/shoppingCart')

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
            res.redirect('/shoppingCart')

        }

    } catch (error) {
        console.log(error);
    }
}

const updateCart = async(req,res) => {
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
                console.log(pdt.offerPrice);
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
        console.log(error);
    }
}

const removeCartItem = async(req, res) => {
    try {
        
        const pdtId = req.params.id;
        const userId = req.session.userId;

        console.log('Removing cart item '+pdtId+' from '+userId);

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

        
        console.log(userData);
        res.redirect('/shoppingCart');

    } catch (error) {
        console.log(error);
    }
}

const loadProfile = async(req, res) => {
    try {
        console.log('loaded profile');
        const userId = req.session.userId;
        // console.log('userid : '+userId);
        const userData = await User.findById({_id: userId})
        const userAddress = await Addresses.findOne({userId:userId})
        // console.log('User Address \n\n'+ userAddress);

        res.render('userProfile',{ userData, userAddress,isLoggedIn:true,page:'Profile'})
    } catch (error) {
        console.log(error);
    }
}


const loadEditProfile = async(req, res) => {
    try {
        id = req.session.userId;
        // console.log('userId : '+id);
        const userData = await User.findById({_id:id})

        res.render('editProfile',{userData})
    } catch (error) {
        console.log(error); 
    }
}

const postEditProfile = async(req, res) => {
    try {
        const userId = req.session.userId;
        const { fname, lname, mobile} = req.body
        const newUserData = await User.findByIdAndUpdate(
            { _id: userId },
            {
                $set:{
                    fname, lname, mobile
                }
            }
        );

        // console.log("updated userData : \n\n "+newUserData);
        res.redirect('/profile');

    } catch (error) {
        console.log(error);
    }
}


const loadPassConfirmToChangeMail = async(req,res) => {
    try {
        res.render('passConfirmToChangeMail')
    } catch (error) {
        console.log(error);
    }
}

const postPassConfirmToChangeMail = async(req,res) => {
    try {
        const id = req.session.userId;
        const password = req.body.password
        const userData = await User.findById({ _id: id })
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            res.redirect('/profile/changeMail')
        }else{
            console.log("Password didn't Match");
            res.redirect('/profile/')
        }
    } catch (error) {
        console.log(error);
    }
}



const loadChangeMail = async(req,res) => {
    try {
        res.render('changeMail')
        
    } catch (error) {
        console.log(error);
    }
}

////////////////////////////////////////////////
const postChangeMail = async(req,res) => {
    try {

        const newMail = req.body.email

        const isMailExist = await User.findOne({email:newMail})

        if(isMailExist){
            console.log('Mail Already Exist');
            return
        }else{
            
            const OTP = req.session.OTP = getOTP()
            console.log('OTP generated when posted new email '+OTP);
            sendVerifyMail(newMail, OTP); 
            req.session.newMail = newMail
            res.render('otpToChangeMail')
        }


    } catch (error) {
        console.log(error);
    }
}

const otpValidationToChangeMail = async(req,res) => {
    try {
        const userId = req.session.userId;
        const newMail = req.session.newMail;
        const OTP = req.body.OTP;
        const adminOTP = req.session.OTP

        console.log(newMail);
        console.log(OTP);
        console.log(adminOTP);

        if(OTP == adminOTP){

            console.log('OTP Matched');

            const userData = await User.findByIdAndUpdate(
                {_id:userId},
                {
                    $set:{
                        email: newMail
                    }
                }
            )

            console.log('User Data after Mail updation \n\n'+userData);
            res.redirect('/profile')

        }else{
            console.log('OTP not correct');
        }
    } catch (error) {
        console.log(error);
    }
}

const loadChangePassword = async(req, res ) => {
    try {
        console.log('loaded change password page');
        res.render('changePass')
    } catch (error) {
        console.log(error);
    }
}

const postChangePassword = async(req, res ) => {
    try {
        console.log('posted change password');

        const userId = req.session.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        console.log('oldPassword'+oldPassword+'\n newPassord'+newPassword);

        if(newPassword !== confirmPassword){
            console.log('newPassword and confirmPassword not matching :(' );
            return res.redirect('/profile/changePassword')
        }

        const userData = await User.findById({ _id: userId });

        const passwordMatch = await bcrypt.compare(oldPassword, userData.password);
        console.log('passwordMatch : '+passwordMatch);
        if(passwordMatch){
            console.log('old password matched');
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
        }else{
            console.log('incorrect password');
            return res.redirect('/profile/changePassword');
        }
    } catch (error) {
        console.log(error);
    }
}


/////////////////////////////////////////////////////////
const forgotPassword = async(req, res ) => {
    try {
        console.log('loaded forgot password');
        const userMail = await User.findById({_id: req.session.userId},{email:1,_id:0})
        const OTP = req.session.OTP = getOTP() 
        sendVerifyMail(userMail.email, OTP);
        res.render('forgotPasswordVerification')

    } catch (error) {
        console.log(error);
    }
}

const verifyOTPforgotPass = async(req, res) => {
    try {
        const userOTP = req.body.OTP
        const adminOTP = req.session.OTP
        if(userOTP == adminOTP){
            console.log('OTP matched :) ');
            res.render('resetPassword')
        }else{
            console.log('OTP not matching .... :(');
            res.redirect('/profile/forgotPassword')
        }
    } catch (error) {
        console.log(error);
    }
}

const loadResetPassword = async(req, res ) => {
    try {
        res.render('resetPassword')
    } catch (error) {
        console.log(error);
    }
}

const postResetPassword = async(req, res ) => {
    try {
        const { newPassword, confirmPassword} = req.body
        if(newPassword !== confirmPassword){
            console.log('Entered Passwords are not matching');
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
        console.log(error);
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
    updateCart

}