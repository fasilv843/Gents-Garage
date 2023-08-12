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

        res.render('checkout',{isLoggedIn : true, page:'Checkout', userAddress, cart, coupons, walletBalance})
    } catch (error) {
        next(error);
    }
}


const placeOrder = async(req, res) => {
    try {

        //getting details needed
        const addressId = req.body.address
        const paymentMethod = req.body.payment
        const userId = req.session.userId

        //getting selected address
        const userAddress = await Addresses.findOne({userId})
        const address = userAddress.addresses.find(obj => obj._id.toString() === addressId)
        req.session.deliveryAddress = address;

        //getting cart items
        const userData = await User.findById({_id:userId}).populate('cart.productId')
        const cart = userData.cart
        
        req.session.cart = cart;

        let products = []

        cart.forEach((pdt) => {
            let discountPrice;
            let totalDiscount;
            if(pdt.productId.offerPrice){
                discountPrice = pdt.productId.price - pdt.productId.offerPrice
                totalDiscount = discountPrice*pdt.quantity
            }else{
                discountPrice = pdt.discountPrice,
                totalDiscount = pdt.quantity*pdt.discountPrice
            }
            const product = {
                productId: pdt.productId._id,
                productName: pdt.productId.name,
                productPrice: pdt.productId.price,
                discountPrice,
                quantity: pdt.quantity,
                totalPrice: pdt.quantity*pdt.productId.price,
                totalDiscount
            }
            products.push(product)
        })

        req.session.products = products;

        let totalPrice = 0;
        if(cart.length){

            //Finding total price
            for(let i=0; i<products.length; i++){
                totalPrice += (products[i].totalPrice - products[i].totalDiscount)
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
            
            
            if(paymentMethod === 'COD'){
                console.log('Payment method is COD');
                console.log(address);
                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMethod,
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

            }else if(paymentMethod === 'Razorpay'){
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
            }else if(paymentMethod == 'Wallet'){
                console.log('Payment method is COD');
                console.log(address);
                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMethod,
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
        next(error);
    }
}

const verifyPayment = async(req,res) => {
    try {

        const userId = req.session.userId;
        const details = req.body

        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256',process.env.KEY_SECRET)
        
        hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        if(hmac === details['response[razorpay_signature]']){
                     
            let totalPrice = req.session.totalPrice
            let couponCode = '';
            let couponDiscount = 0;

            if(req.session.coupon){
                couponCode = req.session.coupon.code
                couponDiscount = req.session.coupon.discount
                totalPrice = totalPrice - (totalPrice * (couponDiscount / 100))
            }

            await new Orders({
                userId, 
                deliveryAddress: req.session.deliveryAddress,
                totalPrice,
                products:  req.session.products, 
                paymentMethod:'Razorpay',
                status: 'Order Confirmed',
                date: new Date(),
                couponCode,
                couponDiscount
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
        next(error);
    }
}



const loadMyOrders = async(req, res) => {
    try {
        console.log('Loaded my orders');
        const userId = req.session.userId;
        const orderData = await Orders.find({userId}).populate('products.productId').sort({date: -1})
        res.render('myOrders',{isLoggedIn:true, page: 'My Orders', parentPage: 'Profile',orderData})
    } catch (error) {
        next(error);
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
        next(error);
    }
}

const loadOrderSuccess = async(req, res) => {
    try {
        const result = req.query.result
        console.log('loaded Order Success');
        const isLoggedIn = Boolean(req.session.userId)

        res.render('orderSuccess',{isLoggedIn, result})
    } catch (error) {
                next(error);
    }
}

const loadOrdersList = async(req, res) => {
    try {
        const ordersData = await Orders.find({}).populate('userId').populate('products.productId')
        
        res.render('ordersList',{ordersData, page:'Orders List'})
    } catch (error) {
        next(error);
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
        next(error);
    }
}

const cancelOrder = async(req,res) => {
    try {
        const orderId = req.params.orderId
        const cancelledBy = req.query.cancelledBy
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

        //Updating wallet if order not COD
        if(orderData.paymentMethod !== 'COD'){
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
                next(error);
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
                next(error);
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
        next(error)
    }
}

const loadInvoice = async(req,res, next) => {
    try {
        const { orderId } = req.params
        const isLoggedIn = Boolean(req.session.userId)
        const order = await Orders.findById({_id: orderId})
        let discount;
        if(order.coupon){
            discount = Math.floor(order.totalPrice/( 1- (order.couponDiscount/100)))
        }

        res.render('invoice',{order, isLoggedIn, page:'Invoice', discount})
    } catch (error) {
        next(error)
    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    loadOrderSuccess,
    loadMyOrders,
    loadViewOrderDetails,
    loadOrdersList,
    changeOrderStatus,
    cancelOrder,
    verifyPayment,
    returnOrder,
    approveReturn,
    loadInvoice
}