const User = require('../models/userModel');
const Products = require('../models/productModel');
const Addresses = require('../models/addressModel');
const Orders = require('../models/orderModel');


const loadCheckout = async(req, res ) => {
    try {
        const userId = req.session.userId;

        const userAddress = await Addresses.findOne({ userId: userId})
        const userData = await User.findById({_id: userId}).populate('cart.productId')
        const cart = userData.cart
        console.log(cart);
        // console.log(userAddress);

        res.render('user/checkout',{isLoggedIn : true, page:'Checkout', userAddress, cart})
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async(req, res) => {
    try {

        console.log('On placeOrder Controller');

        //getting details needed
        const addressId = req.body.address
        const paymentMehod = req.body.payment
        const userId = req.session.userId

        //getting selected address
        const userAddress = await Addresses.findOne({userId})
        const address = userAddress.addresses.find(obj => obj._id.toString() === addressId)
        // console.log('Address \n\n'+address);

        //converting address obj to string
        // const addressString = address.userName+' '+address.mobile+' '+
        //                       address.address+' '+address.town+' '+
        //                       address.state+' '+address.country+' '+address.zip;
        // console.log(addressString);

        //getting cart items
        const userData = await User.findById({_id:userId}) //.populate('cart.productId')
        const cart = userData.cart
        console.log('Cart : \n\n'+cart)
        console.log('type of cart : '+typeof cart);

        if(cart.length){
            let totalPrice = 0
            for(let i=0; i<cart.length; i++){
                totalPrice += cart[i].productPrice*cart[i].quantity
            }
            console.log(totalPrice);
    
            // cart.reduce((acc, curr) => acc+curr.price*curr.quantity, acc)
    
    
            await new Orders({
                userId, 
                deliveryAddress: address,
                totalPrice,
                products: cart, 
                paymentMehod,
                status: 'Order Confirmed',
                date: new Date()
            }).save()
    
            //Deleting Cart from user collection
            await User.findByIdAndUpdate(
                {_id:userId},
                {
                    $set:{
                        cart: []
                    }
                }
            );
    
            console.log(req.body);
            res.json({status: true})
    
            console.log('Order placed and cart updated');
        }else{
            console.log('Cart is empty');
            res.redirect('/shop')
        }


    } catch (error) {
        console.log(error);
    }
}

const loadOrderSuccess = async(req, res) => {
    try {

        
        console.log('loaded Order Success');
    } catch (error) {
        console.log(error);
    }
}


const loadOrderFailed = async(req, res) => {
    try {


        console.log('loaded order failed');
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    loadOrderSuccess,
    loadOrderFailed
}