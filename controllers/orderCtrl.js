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

        //getting cart items
        const userData = await User.findById({_id:userId}).populate('cart.productId')
        const cart = userData.cart

        console.log('Cart : \n\n'+cart)
        console.log('type of cart : '+typeof cart);

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

        if(cart.length){

            //Finding total price
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
                products, 
                paymentMehod,
                status: 'Order Confirmed',
                date: new Date()
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

const loadMyOrders = async(req, res) => {
    try {
        console.log('Loaded my orders');
        const userId = req.session.userId;
        const orderData = await Orders.find({userId}).populate('products.productId')
        console.log(orderData);
        const product = orderData[0].products
        console.log('Products of first order : \n\n\n'+product);
        res.render('user/myOrders',{isLoggedIn:true, page: 'My Orders', parentPage: 'Profile',orderData})
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
        }

        res.render('user/orderDetails',{isLoggedIn:true, page :'Order Details', parentPage: 'My Orders',orderData, status})

    } catch (error) {
        console.log(error);
    }
}

const loadOrderSuccess = async(req, res) => {
    try {

        console.log('loaded Order Success');
        res.send('Order Success')
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

        console.log(ordersData);
        
        res.render('admin/ordersList',{ordersData, page:'Orders List'})
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

const cancelOrderByUser = async(req,res) => {
    try {
        const orderId = req.params.orderId
        await Orders.findByIdAndUpdate(
            {_id: orderId},
            {
                $set:{
                    status: 'Cancelled'
                }
            }
        )
        res.redirect('/profile/myOrders')
    } catch (error) {
        console.log(error);
    }
}

const cancelOrderByAdmin = async(req,res) => {
    try {
        const orderId = req.params.orderId
        await Orders.findByIdAndUpdate(
            {_id: orderId},
            {
                $set:{
                    status: 'Cancelled By Admin'
                }
            }
        )
        res.redirect('/admin/ordersList')
    } catch (error) {
        console.log(error);
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
    cancelOrderByUser,
    cancelOrderByAdmin
}