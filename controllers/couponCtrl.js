
const Coupons = require('../models/couponModel')
const User = require('../models/userModel')


const loadCoupons = async(req, res, next) => {
    try {
        const coupons = await Coupons.find({});
        res.render('coupons',{page:'Coupons',coupons})
    } catch (error) {
        next(error)
    }
}

const loadAddCoupon = async(req, res, next) => {
    try {
        res.render('addCoupon',{page:'Coupons'})
    } catch (error) {
        next(error)
    }
}

const postAddCoupon = async(req, res, next) => {
    try {

        const { discount, minPurchase, expiryDate, description } = req.body;
        const code = req.body.code.toUpperCase()

        const isCodeExist = await Coupons.findOne({code})
        if(!isCodeExist){
            await new Coupons({
                code, discount, minPurchase, expiryDate, description
            }).save()
        }else{
            console.log('Code already exist');
        }

        res.redirect('/admin/coupons')

    } catch (error) {
        next(error);
    }
}

const loadEditCoupon = async(req, res, next) => {
    try {
        const couponId = req.params.couponId;
        const couponData = await Coupons.findById({_id:couponId})
        res.render('editCoupon',{couponData, page:'Coupons'})
    } catch (error) {
        next(error)
    }
}

const postEditCoupon = async(req, res, next) => {
    try {
        console.log('posting edit coupon');
        const couponId = req.params.couponId;
        const { discount, minPurchase, expiryDate, description } = req.body;
        const code = req.body.code.toUpperCase()

        const isCodeExist = await Coupons.findOne({code})

        if(!isCodeExist || isCodeExist._id == couponId){

            await Coupons.findByIdAndUpdate(
                { _id: couponId },
                {
                    $set:{
                        code, discount, minPurchase, expiryDate, description
                    }
                }
            );

        }else{
            console.log('Code already exist, update expiry date if you want to add same code again');
        }

        res.redirect('/admin/coupons');

    } catch (error) {
        next(error)
    }
}


const cancelCoupon = async(req, res, next) => {
    try {
        const couponId = req.params.couponId;

        const couponData = await Coupons.findById({_id:couponId})
        couponData.isCancelled = !couponData.isCancelled
        await couponData.save()
        
        res.redirect('/admin/coupons');
    } catch (error) {
        next(error)
    }
}

const applyCoupon = async(req, res, next) => {
    try {
        console.log('On apply coupon controller');
        const userId = req.session.userId;
        const code = req.body.code.toUpperCase()

        const couponData = await Coupons.findOne({code})
        let userData = await User.findById({_id:userId}).populate('cart.productId')
        let cart = userData.cart;

        //finding total cart price
        let totalPrice = 0;
        let totalDiscountPrice = 0;
        cart.forEach(pdt => {
            totalPrice += pdt.productPrice*pdt.quantity
            if(pdt.productId.offerPrice){
                totalDiscountPrice += (pdt.productPrice - pdt.productId.offerPrice)*pdt.quantity
            }else{
                totalDiscountPrice += pdt.discountPrice*pdt.quantity
            }
            
        });

        const cartAmount = totalPrice - totalDiscountPrice;

        if(couponData && !couponData.isCancelled){
            if(cartAmount >= couponData.minPurchase){
                if(couponData.expiryDate >= new Date()){
                    const isCodeUsed = couponData.usedUsers.find( id => id == userId);
                    if(!isCodeUsed){

                        req.session.coupon = couponData;
                        let payAmount = cartAmount - ( cartAmount* (couponData.discount / 100))

                        res.json({
                            status:true, 
                            message: 'Success',
                            couponDiscount : couponData.discount,
                            payAmount
                        });

                    }else{
                        res.json({status:false, message:'Coupon already used'})
                    }
                }else{
                    res.json({status:false, message:`Coupon expired`})
                }
            }else{
                res.json({status:false, message:`Min purchase should be greaterthan or equal to ${couponData.minPurchase}`})
            }
        }else{
            res.json({status:false, message:"Coupon doesn't exist"})
        }

    } catch (error) {
        next(error)
    }
}

const removeCoupon = async(req, res, next) => {
    try {
        req.session.couponData = null
        res.json({ status: true })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadCoupons,
    loadAddCoupon,
    postAddCoupon,
    loadEditCoupon,
    postEditCoupon,
    cancelCoupon,
    applyCoupon,
    removeCoupon
}