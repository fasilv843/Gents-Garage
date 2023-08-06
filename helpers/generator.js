
const bcrypt = require('bcrypt')


const getOTP = () =>  Math.floor( 1000000*Math.random() )

const getReferralCode = () => {

    // Function to generate a random alphanumeric code
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        referralCode += charset[randomIndex];
    }
    return referralCode;
}

const securePassword = async(password) => {
    try {
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getOTP,
    getReferralCode,
    securePassword
}