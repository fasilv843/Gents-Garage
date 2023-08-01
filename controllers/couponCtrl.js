
const Coupons = require('../models/couponModel')


const loadCoupons = async(req, res) => {
    try {
        const coupons = await Coupons.find({});
        res.render('admin/coupons',{page:'Coupons',coupons})
    } catch (error) {
        console.log(error);
    }
}

const loadAddCoupon = async(req, res) => {
    try {
        res.render('admin/addCoupon',{page:'Coupons'})
    } catch (error) {
        console.log(error);
    }
}

const postAddCoupon = async(req, res) => {
    try {

        console.log('posting add coupon');

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
        console.log(error);
    }
}

const loadEditCoupon = async(req, res) => {
    try {
        const couponId = req.params.couponId;
        const couponData = await Coupons.findById({_id:couponId})
        res.render('admin/editCoupon',{couponData, page:'Coupons'})
    } catch (error) {
        console.log(error);
    }
}

const postEditCoupon = async(req, res) => {
    try {
        console.log('posting edit coupon');
        const couponId = req.params.couponId;
        const { discount, minPurchase, expiryDate, description } = req.body;
        const code = req.body.code.toUpperCase()

        const isCodeExist = await Coupons.findOne({code})

        if(!isCodeExist){

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

        res.redirect('admin/coupons');

    } catch (error) {
        console.log(error);
    }
}


const cancelCoupon = async(req, res) => {
    try {
        console.log('cancelling coupon');

        const couponId = req.params.couponId;
        const couponData = await Coupons.findById({_id:couponId})

        if(couponData.isCancelled){

            await Coupons.findByIdAndUpdate(
                { _id: couponId },
                {
                    $set:{
                        isCancelled: false
                    }
                }
            );

        }else{

            await Coupons.findByIdAndUpdate(
                { _id: couponId },
                {
                    $set:{
                        isCancelled: true
                    }
                }
            );

        }

        res.redirect('/admin/coupons');

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadCoupons,
    loadAddCoupon,
    postAddCoupon,
    loadEditCoupon,
    postEditCoupon,
    cancelCoupon
}