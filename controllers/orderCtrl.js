const User = require('../models/userModel');
const Products = require('../models/productModel');
const Addresses = require('../models/addressModel');
const Orders = require('../models/orderModel');
const Coupons = require('../models/couponModel')
require('dotenv').config()
const Razorpay = require('razorpay')
const { updateWallet } = require('../helpers/helpersFunctions')


var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret:  process.env.KEY_SECRET,
});

const loadCheckout = async(req, res, next) => {
    try {
        const userId = req.session.userId;

        const userAddress = await Addresses.findOne({ userId: userId})
        const userData = await User.findById({_id: userId}).populate('cart.productId')
        const cart = userData.cart
        
        if(!cart){
            return redirect('/shoppingCart')
        }

        const walletBalance = userData.wallet;
        const coupons = await Coupons.findByIsCancelled(false)

        res.render('checkout',{isLoggedIn : true, page:'Checkout', userAddress, cart, coupons, walletBalance, userId})
    } catch (error) {
        next(error);
    }
}


const placeOrder = async(req, res, next) => {
    try {

        //getting details needed
        const addressId = req.body.address
        const paymentMethod = req.body.payment
        const isWalletSelected = req.body.walletCheckBox
        const userId = req.session.userId

        //getting selected address
        const userAddress = await Addresses.findOne({userId})
        const address = userAddress.addresses.find(obj => obj._id.toString() === addressId)
        req.session.deliveryAddress = address;

        //getting cart items
        const userData = await User.findById({_id:userId}).populate('cart.productId')
        const cart = userData.cart
        const walletAmount = req.session.walletAmount = parseInt(userData.wallet)
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
                totalDiscount,
                status: 'Order Confirmed'
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
            
            let couponCode = '';
            let couponDiscount = 0;
            let couponDiscountType;
            if(req.session.coupon){

                const coupon = req.session.coupon
                couponCode = coupon.code
                couponDiscount = coupon.discountAmount

                if(coupon.discountType === 'Percentage'){

                    couponDiscountType = 'Percentage';
                    const reducePrice =  totalPrice * (couponDiscount / 100)

                    if(reducePrice >= coupon.maxDiscountAmount){
                        totalPrice -= coupon.maxDiscountAmount
                    }else{
                        totalPrice -= reducePrice
                    }

                }else{
                    couponDiscountType = 'Fixed Amount';
                    totalPrice = totalPrice - couponDiscount
                }
                
            }

            req.session.isWalletSelected = isWalletSelected;
            req.session.totalPrice = totalPrice;
            console.log(totalPrice);
            
            if(paymentMethod === 'COD'){
                console.log('Payment method is COD');

                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMethod,
                    status: 'Order Confirmed',
                    couponCode,
                    couponDiscount,
                    couponDiscountType
                }).save()
    
                //Reducing quantity/stock of purchased products from Products Collection
                for (const { productId, quantity } of cart) {
                    await Products.updateOne(
                        { _id: productId._id },
                        { $inc: { quantity: -quantity } }
                    );
                }

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

                if(isWalletSelected){
                    totalPrice = totalPrice - walletAmount
                }

                var options = {
                    amount: totalPrice*100,
                    currency:'INR',
                    receipt: "hello"
                }

                instance.orders.create(options, (err, order) => {
                    if(err){
                        console.log(err);
                    }else{
                        res.json({ status: 'Razorpay', order:order })
                    }

                })
                // console.log('instance created :>');
            }else if(paymentMethod == 'Wallet'){

                await new Orders({
                    userId, 
                    deliveryAddress: address,
                    totalPrice,
                    products, 
                    paymentMethod,
                    status: 'Order Confirmed',
                    // date: new Date(),
                    couponCode,
                    couponDiscount,
                    couponDiscountType
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

                const walletHistory = {
                    date: new Date(),
                    amount: -totalPrice,
                    message: 'Product Purchase'
                }

                // Decrementing wallet amount
                await User.findByIdAndUpdate(
                    { _id: userId },
                    {
                        $inc: {
                            wallet: -totalPrice
                        },
                        $push:{
                            walletHistory
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

const verifyPayment = async(req,res,next) => {
    try {

        const userId = req.session.userId;
        const details = req.body

        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256',process.env.KEY_SECRET)
        
        hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        if(hmac === details['response[razorpay_signature]']){
                     
            let totalPrice = req.session.totalPrice

            const coupon = req.session.coupon
            let couponCode = '';
            let couponDiscount = 0;
            let couponDiscountType;
            if(coupon){
                couponCode = coupon.code
                couponDiscount = coupon.discountAmount
                couponDiscountType = coupon.discountType
            }

            await new Orders({
                userId, 
                deliveryAddress: req.session.deliveryAddress,
                totalPrice,
                products:  req.session.products, 
                paymentMethod:'Razorpay',
                status: 'Order Confirmed',
                // date: new Date(),
                couponCode,
                couponDiscount,
                couponDiscountType
            }).save()
            
            if(req.session.isWalletSelected){
                const userData = await User.findById({ _id: userId });
                userData.walletHistory.push(
                    {
                        date: new Date(),
                        amount: userData.wallet,
                        message: 'Product Purchase'
                    }
                )

                userData.wallet = 0;
                await userData.save()
            }

            //Reducing quantity/stock of purchased products from Products Collection
            const cart = req.session.cart;
            for (const { productId, quantity } of cart) {
                await Products.updateOne(
                    { _id: productId._id },
                    { $inc: { quantity: -quantity } }
                );
            }

            //Adding user to usedUsers list in Coupons collection
            if(coupon != null){
                await Coupons.findByIdAndUpdate(
                    {_id:req.session.coupon._id},
                    {
                        $push:{
                            usedUsers: userId
                        }
                    }
                )
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



const loadMyOrders = async(req, res, next) => {
    try {
        console.log('Loaded my orders');
        const userId = req.session.userId;
        const orderData = await Orders.find({userId}).populate('products.productId').sort({createdAt: -1})
        res.render('myOrders',{isLoggedIn:true, page: 'My Orders', parentPage: 'Profile',orderData})
    } catch (error) {
        next(error);
    }
}

const loadViewOrderDetails = async(req, res, next) => {
    try {
        // console.log('loaded view order details page');
        const orderId = req.params.orderId;
        const userId = req.session.userId;

        const orderData = await Orders.findById({_id:orderId}).populate('products.productId')
        // console.log(orderData);

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

const loadOrderSuccess = async(req, res, next) => {
    try {
        const result = req.query.result
        // console.log('loaded Order Success');
        const isLoggedIn = Boolean(req.session.userId)

        res.render('orderSuccess',{isLoggedIn, result})
    } catch (error) {
        next(error);
    }
}

const loadOrdersList = async(req, res, next) => {
    try {

        let pageNum = 1;
        if(req.query.pageNum){
            pageNum = parseInt(req.query.pageNum) 
        }

        let limit = 10;
        if(req.query.limit){
            limit = parseInt(req.query.limit);
        }

        const totalOrderCount = await Orders.find({}).count()
        let pageCount = Math.ceil( totalOrderCount / limit)

        const ordersData = await Orders.find({}).populate('userId').populate('products.productId').sort({ createdAt: -1 }).skip( (pageNum - 1)*limit ).limit(limit);
        
        res.render('ordersList',{ordersData, page:'Orders List',pageCount, pageNum, limit})
    } catch (error) {
        next(error);
    }
}


const changeOrderStatus = async(req,res, next) => {
    try {
        const orderId = req.body.orderId
        const status = req.body.status
        const orderData = await Orders.findById({_id: orderId})
        for (const pdt of orderData.products){

            if(pdt.status !== 'Delivered' && 
                pdt.status !== 'Pending Return Approval' &&
                pdt.status !== 'Cancelled' && 
                pdt.status !== 'Cancelled By Admin' && 
                pdt.status !== 'Returned'
            ){
                pdt.status = status
            }

        };
        console.log('orderData saving');
        await orderData.save();
        await updateOrderStatus(orderId, next);

        res.redirect('/admin/ordersList')

    } catch (error) {
        next(error);
    }
}


const updateOrderStatus = async function (orderId, next) {
    try {

            let statusCounts = []
            const orderData = await Orders.findById({ _id: orderId })
            orderData.products.forEach((pdt) => {
                let eachStatusCount = {
                    status: pdt.status,
                    count: 1,
                };
            
                let existingStatusIndex = statusCounts.findIndex(
                    (item) => item.status === pdt.status
                );
            
                if (existingStatusIndex !== -1) {
                    // Increment the count of an existing status
                    statusCounts[existingStatusIndex].count += 1;
                } else {
                    statusCounts.push(eachStatusCount);
                }
            });

            if(statusCounts.length === 1){
                orderData.status = statusCounts[0].status
                await orderData.save()
                return
            }

            let isOrderConfirmedExists = false;
            let isShippedExists = false;
            let isOutForDeliveryExists = false;
            let isDeliveredExists = false;
            let cancelledByUserCount; 
            let cancelledByAdminCount;
            let returnApprovalCount;
            let returnedCount;
            statusCounts.forEach((item) => {

                if(item.status === 'Order Confimed'){
                    isOrderConfirmedExists = true
                }

                if(item.status === 'Shipped'){
                    isShippedExists = true
                }

                if(item.status === 'Out For Delivery'){
                    isOutForDeliveryExists = true
                }

                if(item.status === 'Delivered'){
                    isDeliveredExists = true
                }

                if(item.status === 'Cancelled'){
                    cancelledByUserCount = item.count
                }

                if(item.status === 'Cancelled By Admin'){
                    cancelledByAdminCount = item.count
                }

                if(item.status === 'Pending Return Approval'){
                    returnApprovalCount = item.count
                }

                if(item.status === 'Returned'){
                    returnedCount = item.count
                }
                
            });


            if(isOrderConfirmedExists){
                orderData.status = 'Order Confirmed'
                await orderData.save()
                return
            }
            
            if(isShippedExists){
                orderData.status = 'Shipped'
                await orderData.save()
                return
            }
    
            if(isOutForDeliveryExists){
                orderData.status = 'Out For Delivery'
                await orderData.save()
                return
            }
    
    
            if(isDeliveredExists){
                orderData.status = 'Delivered'
                await orderData.save()
                return
            }

            let cancelledCount = 0;
            if(cancelledByUserCount){
                cancelledCount += cancelledByUserCount
            }
            if(cancelledByAdminCount){
                cancelledCount += cancelledByAdminCount
            }

            if(cancelledByUserCount === orderData.products.length || cancelledCount === orderData.products.length){
                orderData.status = 'Cancelled'
                await orderData.save()
                return;
            }
            
            if(cancelledByAdminCount === orderData.products.length){
                orderData.status = 'Cancelled By Admin'
                await orderData.save()
                return;
            }

            if( cancelledCount + returnApprovalCount + returnedCount === orderData.products.length){
                orderData.status = 'Pending Return Approval'
                await orderData.save()
                return;
            }
    
            if( cancelledCount + returnedCount === orderData.products.length){
                orderData.status = 'Returned'
                await orderData.save()
                return;
            }

    } catch (error) {
        next(error)
    }
}

const cancelOrder = async(req,res, next) => {
    try {
        const orderId = req.params.orderId
        const cancelledBy = req.query.cancelledBy
        const orderData = await Orders.findById({_id:orderId})
        const userId = orderData.userId


        // console.log(cancelledBy);
        let refundAmount = 0;
        if(cancelledBy == 'user'){

            for (const pdt of orderData.products){

                if(pdt.status !== 'Delivered' && 
                    pdt.status !== 'Pending Return Approval' &&
                    pdt.status !== 'Cancelled' && 
                    pdt.status !== 'Cancelled By Admin' && 
                    pdt.status !== 'Returned'
                ){
                    pdt.status = 'Cancelled'
                    refundAmount = refundAmount + (pdt.totalPrice - pdt.totalDiscount)

                    //Incrementing Product Stock
                    await Products.findByIdAndUpdate(
                        {_id: pdt.productId},
                        {
                            $inc:{
                                quantity: pdt.quantity
                            }
                        }
                    );

                    console.log('pdt.status set to Cancelled');
                }

            };

            await orderData.save();
            await updateOrderStatus(orderId, next);


        }else if(cancelledBy == 'admin'){

            for (const pdt of orderData.products){

                if(pdt.status !== 'Delivered' && 
                    pdt.status !== 'Pending Return Approval' &&
                    pdt.status !== 'Cancelled' && 
                    pdt.status !== 'Cancelled By Admin' && 
                    pdt.status !== 'Returned'
                ){
                    pdt.status = 'Cancelled By Admin'
                    refundAmount = refundAmount + (pdt.totalPrice - pdt.totalDiscount)

                    //Incrementing Product Stock
                    await Products.findByIdAndUpdate(
                        {_id: pdt.productId},
                        {
                            $inc:{
                                quantity: pdt.quantity
                            }
                        }
                    );

                }

            };

        }

        await orderData.save();
        await updateOrderStatus(orderId, next);

        //Updating wallet if order not COD
        if(orderData.paymentMethod !== 'COD'){
            await updateWallet(userId, refundAmount, 'Refund of Order Cancellation' )
        }

        if(cancelledBy == 'user'){
            res.redirect(`/viewOrderDetails/${orderId}`)
        }else if(cancelledBy == 'admin'){
            res.redirect('/admin/ordersList')
        }

    } catch (error) {
                next(error);
    }
}

const cancelSinglePdt = async(req, res, next) => {
    try {
        const { orderId, pdtId } = req.params
        const { cancelledBy } = req.query
        const orderData = await Orders.findById({_id: orderId})
        const userId = orderData.userId
        
        let refundAmount;
        for( const pdt of orderData.products){

            if(pdt._id == pdtId){

                if(cancelledBy == 'admin'){
                    pdt.status = 'Cancelled By Admin'
                }else if(cancelledBy == 'user'){
                    pdt.status = 'Cancelled'
                }
                
                refundAmount = pdt.totalPrice - pdt.totalDiscount;

                //Incrementing Product Stock
                await Products.findByIdAndUpdate(
                    {_id: pdt.productId},
                    {
                        $inc:{
                            quantity: pdt.quantity
                        }
                    }
                );

                break;
            }
        }

        await orderData.save()
        await updateOrderStatus(orderId, next);
        await updateWallet(userId, refundAmount, 'Refund of Order Cancellation')

        if(cancelledBy == 'admin'){
            res.redirect(`/admin/ordersList`)
        }else if(cancelledBy == 'user'){
            res.redirect(`/viewOrderDetails/${orderId}`)

        }

    } catch (error) {
        next(error)
    }
}

const returnOrder = async(req, res, next) => {
    try {

        const orderId = req.params.orderId
        const orderData = await Orders.findById({ _id: orderId })

        for (const pdt of orderData.products){

            if(pdt.status === 'Delivered' ){
                pdt.status = 'Pending Return Approval'
            }
        };

        await orderData.save()
        await updateOrderStatus(orderId, next);

        
        res.redirect(`/viewOrderDetails/${orderId}`)
        
    } catch (error) {
                next(error);
    }
}

const returnSinglePdt = async(req, res, next) => {
    try {
        const { orderId, pdtId } = req.params
        const orderData = await Orders.findById({_id: orderId})
        
        for( const pdt of orderData.products){
            if(pdt._id == pdtId){
                pdt.status = 'Pending Return Approval'
                break;
            }
        }

        await orderData.save()
        await updateOrderStatus(orderId, next);

        res.redirect(`/viewOrderDetails/${orderId}`)

    } catch (error) {
        next(error)
    }
}

const approveReturn = async(req,res,next) => {
    try {
        const orderId = req.params.orderId;

        const orderData = await Orders.findById({ _id: orderId })

        let refundAmount = 0;
        for (const pdt of orderData.products){

            if(pdt.status === 'Pending Return Approval' ){
                pdt.status = 'Returned'

                refundAmount = refundAmount + (pdt.totalPrice - pdt.totalDiscount)

                //Incrementing Product Stock
                await Products.findByIdAndUpdate(
                    {_id: pdt.productId},
                    {
                        $inc:{
                            quantity: pdt.quantity
                        }
                    }
                );

            }
        };

        await orderData.save()
        await updateOrderStatus(orderId, next);


        const userId = orderData.userId;

        //Adding amount into users wallet
        await updateWallet(userId, refundAmount, 'Refund of Returned Order')

        res.redirect('/admin/ordersList')
    } catch (error) {
        next(error)
    }
}


const approveReturnForSinglePdt = async(req, res, next) => {
    try {
        const { orderId, pdtId } = req.params
        const orderData = await Orders.findById({_id: orderId})
        const userId = orderData.userId;

        let refundAmount;
        for( const pdt of orderData.products){
            if(pdt._id == pdtId){

                pdt.status = 'Returned'

                refundAmount = pdt.totalPrice - pdt.totalDiscount;

                //Incrementing Product Stock
                await Products.findByIdAndUpdate(
                    {_id: pdt.productId},
                    {
                        $inc:{
                            quantity: pdt.quantity
                        }
                    }
                );

                break;
            }
        }

        await orderData.save()
        await updateOrderStatus(orderId, next);
        await updateWallet(userId, refundAmount, 'Refund of Retrned Product')


        res.redirect(`/admin/ordersList`)

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
    cancelSinglePdt,
    verifyPayment,
    returnOrder,
    approveReturn,
    loadInvoice,
    returnSinglePdt,
    approveReturnForSinglePdt
}