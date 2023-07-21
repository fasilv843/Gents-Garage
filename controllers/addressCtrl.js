const Addresses = require('../models/addressModel')

const loadAddAddress = async(req, res) => {
    try {
        res.render('user/addAddress',{isLoggedIn : true, page:'Add Address', parentPage:'Profile'});
    } catch (error) {
        console.log(error);
    }
}

const postAddAddress = async(req, res) => {
    try {
        const userId = req.session.userId;
        const { fname, lname, email, mobile, town, state, country, zip, address } = req.body
        await new Addresses({
            userId, fname, lname, email, mobile, town, state, country, zip, address
        }).save()
        console.log('Address Saved on database');
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadAddAddress,
    postAddAddress
}