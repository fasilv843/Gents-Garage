
const nodemailer = require('nodemailer')
require('dotenv').config()


const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});


const sendVerifyMail = async(userEmail, OTP) => {
    try {
        
        const mailOptions = {
            from: process.env.GMAIL,
            to: userEmail,
            subject:'Email Verification',
            html:'<p>Hello please  Enter this otp to verify '+OTP+' your mail. OTP valid for 10 mins</p>'
        }

        transporter.sendMail(mailOptions)

    } catch (error) {
        throw error
    }
}

const sendContactMail = async(name, userMail, subject, message) => {
    try {
        
        const mailOptions = {
            from: userMail,
            to: process.env.GMAIL,
            subject: subject,
            html: `<h4>Hi I'm ${name}</h4><br><p>${message}</p>`
        }

        transporter.sendMail(mailOptions)

    } catch (error) {
        throw error
    }
}

module.exports = {
    sendVerifyMail,
    sendContactMail
}

