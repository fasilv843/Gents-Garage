const Addresses = require('../models/addressModel')
const Users = require('../models/userModel')

const loadAddAddress = async(req, res, next) => {
    try {
        const returnPage = req.query.returnPage
        res.render('addAddress',{isLoggedIn : true, page:'Add Address', parentPage:'Profile', returnPage})
    } catch (error) {
        next(error)
    }
}

const postAddAddress = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const { name, email, mobile, town, state, country, zip, address } = req.body
        const returnPage = req.params.returnPage

        const newAddress = { userName: name, email, mobile, town, state, country, zip, address }

        const isUserHasAddress = await Addresses.findOne({userId:userId})

        if(isUserHasAddress){
            await Addresses.updateOne({userId:userId},
                {
                    $addToSet:{
                       addresses : newAddress
                    }
                }
            );

            switch(returnPage){
                case 'profile': 
                    res.redirect('/profile')
                    break;
                case 'checkout':
                    res.redirect('/shoppingCart/proceedToCheckout')
                    break;
            }

        }else{
            await new Addresses({
                userId,
                addresses :[ newAddress ]
            }).save()

            switch(returnPage){
                case 'profile': 
                    res.redirect('/profile')
                    break;
                case 'checkout':
                    res.redirect('/shoppingCart/proceedToCheckout')
                    break;
            }
        }

    } catch (error) {
        next(error)
    }
}

const loadEditAddress = async(req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;
        const { returnPage } = req.query

        const addressData = await Addresses.findOne({userId, 'addresses._id':addressId})
        const address = addressData.addresses.find(obj => obj._id.toString() === addressId)
        res.render('editAddress',{address, isLoggedIn: true, page: 'Profile',returnPage})
    } catch (error) {
        next(error)
    }
}

const postEditAddress = async(req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;
        const { name, email, mobile, town, state, country, zip, address } = req.body
        const { returnPage } = req.query


        await Addresses.updateOne(
            {userId, 'addresses._id':addressId},
            {
                $set:{
                    'addresses.$.userName': name,
                    'addresses.$.email': email,
                    'addresses.$.mobile': mobile,
                    'addresses.$.town': town,
                    'addresses.$.state': state,
                    'addresses.$.country': country,
                    'addresses.$.zip': zip,
                    'addresses.$.address': address
                }
            }

        )
            console.log(returnPage);
        if(returnPage == 'profile'){
            res.redirect('/profile');
        }else if(returnPage == 'checkout'){
            res.redirect('/shoppingCart/proceedToCheckout')
        }
        
    } catch (error) {
        next(error)
    }
}

const deleteAddress = async(req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;

        await Addresses.updateOne(
            {userId, 'addresses._id': addressId},
            {
                $pull:{
                    addresses : { _id: addressId }
                }
            }
        )
        res.redirect('/profile');

    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadAddAddress,
    postAddAddress,
    loadEditAddress,
    postEditAddress,
    deleteAddress
}