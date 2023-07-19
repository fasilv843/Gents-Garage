const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config()


const securePassword = async(password) => {
    try {
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}

const loadHome = async(req,res) => {
    try {
        res.render('user/home',{page : 'Home'});
    } catch (error) {
        console.log(error);
    }
}

const loadLogin = async(req,res) => {
    try {
        res.render('user/login');
    } catch (error) {
        console.log(error);
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
                    req.session.userId = userData._id;
                    res.redirect('/')
                }else{
                    console.log('Sorry:( You are blocked by admins');
                    res.render('user/login',{message: 'Sorry:( You are blocked by admins'})
                    return;
                }
            }else{
                console.log('Invalid Password');
                res.render('user/login',{message: 'Invalid Password'})
            }
        }else{
            console.log('User does not exist');
            res.render('user/login',{message: 'User does not exist'})
        }
        
    } catch (error) {
        console.log(error);
    }
}

const loadSignUp = async(req,res) => {
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error);
    }
}

const sendVerifyMail = async(fname, lname, userEmail, OTP) => {
    try {
        const userName = fname+' '+lname;
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"gentsgarageofficial@gmail.com",
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from:'gentsgarageofficial@gmail.com',
            to: userEmail,
            subject:'Email Verification',
            html:'<p>Hello '+userName+' please  Enter this otp to verify '+OTP+ '</a> your mail.</p>'
        }

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email has been sent :- ',info.response);
            }
        })
    } catch (error) {
        console.log(error);
    }
}


let adminOTP;

const saveAndLogin = async(req,res) => {
    try {
        const { fname, lname, email, mobile, password, confirmPassword } = req.body;
        if(password === confirmPassword){

            const userData = await User.findOne({email})
            if(userData){
                console.log('User Already Exists');
                return res.render('user/signup',{message : 'User Already Exists'})
            }

            adminOTP = Math.floor( 1000000*Math.random() )
            sendVerifyMail(fname, lname, email, adminOTP); 
            res.render('user/otpValidation',{ fname, lname, email, mobile, password, message : 'Check Spam mails' })

        }else{
            console.log('password not matching');
            res.render('user/signup',{message : 'Password not matching'})
        }


    } catch (error) {
        console.log(error);
    }
}


const validateOTP = async(req,res) => { 
    try {
        const { fname, lname, email, mobile, password } = req.body
        console.log('req.body.OTP : '+req.body.OTP);
        const userOTP = req.body.OTP
        console.log('adminOTP : '+adminOTP+" "+ typeof adminOTP);
        console.log('userOTP : '+userOTP+" "+ typeof userOTP);
        if(userOTP == adminOTP){
            console.log('OTP Validated Successfully!');
            const sPassword = await securePassword(password)
            const user = new User({
                fname, lname, email, mobile, password:sPassword
            })

            const newUserData = await user.save();
            req.session.userId = newUserData._id;
            res.redirect('/');
        }else{
            console.log('Incorrect OTP');
            res.render('user/otpValidation',{ fname, lname, email, mobile, password, message : 'Incorrect OTP' })
        }
    } catch (error) {
        console.log(error);
    }
}


const loadAboutUs = async(req,res) => {
    try {
        res.render('user/aboutUs',{page : 'About Us'})
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
    loadAboutUs

}