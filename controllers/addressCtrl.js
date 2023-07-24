const Addresses = require('../models/addressModel')
const Users = require('../models/userModel')

const loadAddAddress = async(req, res) => {
    try {
        const returnPage = req.query.returnPage
        console.log('returnPage : '+returnPage);
        res.render('user/addAddress',{isLoggedIn : true, page:'Add Address', parentPage:'Profile', returnPage});
    } catch (error) {
        console.log(error);
    }
}

const postAddAddress = async(req, res) => {
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
            console.log('Address Added to database');
            // res.redirect('/profile')

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

            console.log('Address Saved on database');
            console.log('page : '+page);

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
        console.log(error);
    }
}

const loadEditAddress = async(req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;

        const addressData = await Addresses.findOne({userId, 'addresses._id':addressId})
        const address = addressData.addresses.find(obj => obj._id.toString() === addressId)
        // console.log(address);
        res.render('user/editAddress',{address, isLoggedIn: true, page: 'Profile'})
    } catch (error) {
        console.log(error);
    }
}

const postEditAddress = async(req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;
        const { name, email, mobile, town, state, country, zip, address } = req.body

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
        console.log('Address edited');
        res.redirect('/profile');
        
    } catch (error) {
        console.log(error);
    }
}

const deleteAddress = async(req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;

        console.log('loaded delete address');

        await Addresses.updateOne(
            {userId, 'addresses._id': addressId},
            {
                $pull:{
                    addresses : { _id: addressId }
                }
            }
        )
        console.log('address deleted');  //not working
        res.redirect('/profile');

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadAddAddress,
    postAddAddress,
    loadEditAddress,
    postEditAddress,
    deleteAddress
}