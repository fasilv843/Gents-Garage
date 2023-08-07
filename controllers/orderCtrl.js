const User = require('../models/userModel');
const Products = require('../models/productModel');
const Addresses = require('../models/addressModel');
const Orders = require('../models/orderModel');
const Coupons = require('../models/couponModel')
require('dotenv').config()
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret:  process.env.KEY_SECRET,
});

const loadCheckout = async(req, res ) => {
    try {
        const userId = req.session.userId;

        const userAddress = await Addresses.findOne({ userId: userId})
        const userData = await User.findById({_id: userId}).populate('cart.productId')
        const cart = userData.cart
        
        if(!cart){
            return redirect('/shoppingCart')
        }

        const walletBalance = userData.wallet;

        const coupons = await Coupons.find({isCancelled : false})
        // console.log(cart);
        // console.log(userAddress);

        res.render('checkout',{isLoggedIn : true, page:'Checkout', userAddress, cart, coupons, walletBalance})
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async(req, res) => {
    try {

        console.log('On placeOrder Controller Ooo');

        //getting details needed
        const addressId = req.body.address
        const paymentMehod = req.body.payment
        const userId = req.session.userId

        console.log('addressId : '+addressId);

        //getting selected address
        const userAddress = await Addresses.findOne({userId})
        const address = userAddress.addresses.find(obj => obj._id.toString() === addressId)
        // console.log('Address \n\n'+address);
        req.session.deliveryAddress = address;

        //getting cart items
        const userData = await User.findById({_id:userId}).populate('cart.productId')
        const cart = userData.cart
        
        req.session.cart = cart;

        // console.log('Cart : \n\n'+cart)
        // console.log('type of cart : '+typeof cart);

        let products = []

        cart.forEach((pdt) => {
            const product = {
                productId: pdt.productId._id,
                productName: pdt.productId.name,
                productPrice: pdt.productId.price,
                discountPrice: pdt.productId.discountPrice,
                quantity: pdt.quantity,
                totalPrice: pdt.quantity*pdt.productId.price,
                totalDiscount: pdt.quantity*pdt.productId.discountPrice
            }
            products.push(product)
        })

        req.session.products = products;

        let totalPrice = 0;
        if(cart.length){

            //Finding total price
            for(let i=0; i<cart.length; i++){
                totalPrice += cart[i].productPrice*cart[i].quantity
            }
            console.log(totalPrice);

            req.session.totalPrice = totalPrice  //??

            let couponCode = '';
            let couponDiscount = 0;

            if(req.session.coupon){
                couponCode = req.session.coupon.code
                couponDiscount = req.session.coupon.discount
                totalPrice = totalPrice - (totalPrice * (couponDiscount / 100))
            }
            
            
            if(paymentMehod === 'COD'){
                console.log('Payment method is COD');
                console.log(address);
                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMehod,
                    status: 'Order Confirmed',
                    date: new Date(),
                    couponCode,
                    couponDiscount
                }).save()
    
                //Reducing quantity/stock of purchased products from Products Collection
                for (const { productId, quantity } of cart) {
                    await Products.updateOne(
                        { _id: productId._id },
                        { $inc: { quantity: -quantity } }
                    );
                }
    
                //Deleting Cart from user collection
                await User.findByIdAndUpdate(
                    {_id:userId},
                    {
                        $set:{
                            cart: []
                        }
                    }
                );
    
                req.session.cartCount = 0;
                res.json({status : 'COD'})

            }else if(paymentMehod === 'Razorpay'){
                console.log('Payment method razorpay');
                var options = {
                    amount: totalPrice*100,
                    currency:'INR',
                    receipt: "hello"
                }

                instance.orders.create(options, (err, order) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log('sent json status razorpay');
                        // console.log(order);
                        res.json({ status: 'Razorpay', order:order })
                    }

                })
                // console.log('instance created :>');
            }else if(paymentMehod == 'Wallet'){
                console.log('Payment method is COD');
                console.log(address);
                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMehod,
                    status: 'Order Confirmed',
                    date: new Date(),
                    couponCode,
                    couponDiscount
                }).save()
    
                //Reducing quantity/stock of purchased products from Products Collection
                for (const { productId, quantity } of cart) {
                    await Products.updateOne(
                        { _id: productId._id },
                        { $inc: { quantity: -quantity } }
                    );
                }
    
                //Deleting Cart from user collection
                await User.findByIdAndUpdate(
                    {_id:userId},
                    {
                        $set:{
                            cart: []
                        }
                    }
                );

                //Adding user to usedUsers list in Coupons collection
                if(req.session.coupon != null){
                    await Coupons.findByIdAndUpdate(
                        {_id:req.session.coupon._id},
                        {
                            $push:{
                                usedUsers: userId
                            }
                        }
                    )
                }
    
                req.session.cartCount = 0;

                // Decrementing wallet amount
                await User.findByIdAndUpdate(
                    { _id: userId },
                    {
                        $inc: {
                            wallet: -totalPrice
                        }
                    }
                );

                res.json({status : 'Wallet'})
            }


        }else{
            console.log('Cart is empty');
            res.redirect('/shop')
        }


    } catch (error) {
        console.log(error);
    }
}

const verifyPayment = async(req,res) => {
    try {

        const userId = req.session.userId;
        const details = req.body
        console.log(details['response[razorpay_payment_id]']);
        const keys = Object.keys(details)
        console.log(keys);
        console.log('in verify payment');

        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256',process.env.KEY_SECRET)
        
        hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        console.log(typeof hmac);
        console.log(typeof details['response[razorpay_signature]']);
        if(hmac === details['response[razorpay_signature]']){
                            
            await new Orders({
                userId, 
                deliveryAddress: req.session.deliveryAddress,
                totalPrice:  req.session.totalPrice,
                products:  req.session.products, 
                paymentMehod:'Razorpay',
                status: 'Order Confirmed',
                date: new Date()
            }).save()

            
            //Reducing quantity/stock of purchased products from Products Collection
            const cart = req.session.cart;
            for (const { productId, quantity } of cart) {
                await Products.updateOne(
                    { _id: productId._id },
                    { $inc: { quantity: -quantity } }
                );
            }

            //Deleting Cart from user collection
            await User.findByIdAndUpdate(
                {_id:userId},
                {
                    $set:{
                        cart: []
                    }
                }
            );

            req.session.cartCount = 0;

            res.json({status:true})
        }else{
            res.json({status:false})
        }

    } catch (error) {
        console.log(error);
    }
}



const loadMyOrders = async(req, res) => {
    try {
        console.log('Loaded my orders');
        const userId = req.session.userId;
        const orderData = await Orders.find({userId}).populate('products.productId').sort({date: -1})
        // console.log(orderData);
        // if(orderData){
        //     const product = orderData[0].products
        // }
        // console.log('Products of first order : \n\n\n'+product);
        res.render('myOrders',{isLoggedIn:true, page: 'My Orders', parentPage: 'Profile',orderData})
    } catch (error) {
        console.log(error);
    }
}

const loadViewOrderDetails = async(req, res) => {
    try {
        console.log('loaded view order details page');
        const orderId = req.params.orderId;
        const userId = req.session.userId;

        const orderData = await Orders.findById({_id:orderId}).populate('products.productId')
        console.log(orderData);

        let status;
        switch(orderData.status){
            case 'Order Confirmed':
                status = 1;
                break;
            case 'Shipped':
                status = 2;
                break;
            case 'Out For Delivery':
                status = 3;
                break;
            case 'Delivered':
                status = 4;
                break;
            case 'Cancelled' :
                status = 5;
                break;
            case 'Cancelled By Admin':
                status = 6;
                break;
            case 'Pending Return Approval':
                status = 7;
                break;
            case 'Returned':
                status = 8;
                break;
        }

        res.render('orderDetails',{isLoggedIn:true, page :'Order Details', parentPage: 'My Orders',orderData, status})

    } catch (error) {
        console.log(error);
    }
}

const loadOrderSuccess = async(req, res) => {
    try {

        console.log('loaded Order Success');
        const isLoggedIn = Boolean(req.session.userId)

        res.render('orderSuccess',{isLoggedIn})
    } catch (error) {
        console.log(error);
    }
}


const loadOrderFailed = async(req, res) => {
    try {

        console.log('loaded order failed');
        res.send('Order Failed')
    } catch (error) {
        console.log(error);
    }
}

const loadOrdersList = async(req, res) => {
    try {
        const ordersData = await Orders.find({}).populate('userId').populate('products.productId')

        // console.log(ordersData);
        
        res.render('ordersList',{ordersData, page:'Orders List'})
    } catch (error) {
        console.log(error);
    }
}


const changeOrderStatus = async(req,res) => {
    try {
        console.log('loaded change order status');
        const orderId = req.body.orderId
        const status = req.body.status

        console.log(status);

        await Orders.findByIdAndUpdate(
            { _id: orderId },
            {
                $set:{
                    status
                }
            }
        )

        res.redirect('/admin/ordersList')

    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async(req,res) => {
    try {
        const orderId = req.params.orderId
        const cancelledBy = req.query.cancelledBy
        // const userId = req.session.userId
        const orderData = await Orders.findById({_id:orderId})
        const userId = orderData.userId


        console.log(cancelledBy);
        if(cancelledBy == 'user'){

            await Orders.findByIdAndUpdate(
                {_id: orderId},
                {
                    $set:{
                        status: 'Cancelled'
                    }
                }
            );

        }else if(cancelledBy == 'admin'){

            await Orders.findByIdAndUpdate(
                {_id: orderId},
                {
                    $set:{
                        status: 'Cancelled By Admin'
                    }
                }
            );
        }


        if(orderData.paymentMehod !== 'COD'){
            console.log('cancelled order Payment method razorpay or wallet, updating wallet');
            await User.findByIdAndUpdate(
                {_id: userId },
                {
                    $inc:{
                        wallet: orderData.totalPrice
                    }
                }
            )
        }

        if(cancelledBy == 'user'){
            res.redirect('/profile/myOrders')
        }else if(cancelledBy == 'admin'){
            res.redirect('/admin/ordersList')
        }

    } catch (error) {
        console.log(error);
    }
}

const returnOrder = async(req, res) => {
    try {

        const userId = req.session.userId;
        const orderId = req.params.orderId

        await Orders.findByIdAndUpdate(
            {_id: orderId},
            {
                $set:{
                    status: 'Pending Return Approval'
                }
            }
        );
        
        res.redirect(`/viewOrderDetails/${orderId}`)
        
    } catch (error) {
        console.log(error);
    }
}

const approveReturn = async(req,res,next) => {
    try {
        const orderId = req.params.orderId;

        //Changing status into Returned
        const orderData = await Orders.findByIdAndUpdate(
            {_id:orderId},
            {
                $set:{
                    status: 'Returned'
                }
            }
        );

        const userId = orderData.userId;

        //Adding amount into users wallet
        await User.findByIdAndUpdate(
            {_id:userId},
            {
                $inc:{
                    wallet: orderData.totalPrice
                }
            }
        );

        res.redirect('/admin/ordersList')
    } catch (error) {
        console.log(error);
        next(error)
    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    loadOrderSuccess,
    loadOrderFailed,
    loadMyOrders,
    loadViewOrderDetails,
    loadOrdersList,
    changeOrderStatus,
    cancelOrder,
    verifyPayment,
    returnOrder,
    approveReturn
}