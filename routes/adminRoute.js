const express = require('express');
// const sharp = require('sharp')
const adminCtrl = require('../controllers/adminCtrl');
const categoryCtrl = require('../controllers/categoryCtrl');
const productCtrl = require('../controllers/productCtrl');
const orderCtrl = require('../controllers/orderCtrl')
const couponCtrl = require('../controllers/couponCtrl')
const bannerCtrl = require('../controllers/bannerCtrl')
const offerCtrl = require('../controllers/offerCtrl')
const brandOfferCtrl = require('../controllers/brandOfferCtrl')
const upload = require('../config/multer');
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middleware/auth')


const admin_route = express()

admin_route.set('views','./views/admin')


//Admin Login Handling
admin_route.get('/login', isAdminLoggedOut ,adminCtrl.loadAdminLogin);
admin_route.post('/login', isAdminLoggedOut, adminCtrl.verifyAdminLogin);
admin_route.post('/logout' ,adminCtrl.logoutAdmin)


admin_route.use('/', isAdminLoggedIn)

//Admin Dashboard
admin_route.get('/',adminCtrl.loadDashboard)

//User Handling
admin_route.get('/users',adminCtrl.loadUsers)
admin_route.get('/users/block/:id',adminCtrl.blockUser)

//Category Handling Routes
admin_route.get('/categories',categoryCtrl.loadCategories)
admin_route.post('/categories',categoryCtrl.addCategory);
admin_route.post('/categories/edit',upload.single('categoryImage'),categoryCtrl.editCategory)
admin_route.get('/categories/list/:id',categoryCtrl.listCategory)


//Product Handling Routes
admin_route.get('/products',productCtrl.loadProduct)
admin_route.get('/products/addProduct',productCtrl.loadAddProduct)
admin_route.post('/products/addProduct',upload.array('productImage',3),productCtrl.addProductDetails)
admin_route.get('/products/editProduct/:id',productCtrl.loadEditProduct)
admin_route.post('/products/editProduct',upload.array('productImage',3),productCtrl.postEditProduct)
admin_route.get('/products/deleteProduct/:id',productCtrl.deleteProduct)

admin_route.get('/products/imageDelete/:id',productCtrl.deleteImage)

admin_route.get('/ordersList',orderCtrl.loadOrdersList)
admin_route.post('/changeOrderStatus',orderCtrl.changeOrderStatus)
admin_route.get('/cancelOrder/:orderId',orderCtrl.cancelOrder)
admin_route.get('/cancelSinglePrdt/:orderId/:pdtId',orderCtrl.cancelSinglePdt)
admin_route.get('/approveReturn/:orderId',orderCtrl.approveReturn)
admin_route.get('/approveReturnSinglePrdt/:orderId/:pdtId',orderCtrl.approveReturnForSinglePdt)

admin_route.get('/coupons',couponCtrl.loadCoupons)
admin_route.get('/coupons/addCoupon',couponCtrl.loadAddCoupon)
admin_route.post('/coupons/addCoupon',couponCtrl.postAddCoupon)
admin_route.get('/coupons/editCoupon/:couponId',couponCtrl.loadEditCoupon)
admin_route.post('/coupons/editCoupon/:couponId',couponCtrl.postEditCoupon)
admin_route.get('/coupons/cancelCoupon/:couponId',couponCtrl.cancelCoupon)

admin_route.get('/banners',bannerCtrl.loadBannerList) 
admin_route.post('/addBanner',upload.single('bannerImage'),bannerCtrl.addBanner)
admin_route.post('/updateBanner/:bannerId',upload.single('bannerImage'),bannerCtrl.UpdateBanner)
admin_route.post('/deleteBanner/:bannerId',bannerCtrl.deleteBanner)

admin_route.get('/offers',offerCtrl.loadOffer)
admin_route.get('/offers/addOffer',offerCtrl.loadAddOffer)
admin_route.get('/offers/editOffer/:offerId',offerCtrl.loadEditOffer)

admin_route.post('/offers/addOffer',offerCtrl.postAddOffer)
admin_route.post('/offers/editOffer/:offerId',offerCtrl.postEditOffer)
admin_route.get('/offers/cancelOffer/:offerId',offerCtrl.cancelOffer)
admin_route.post('/applyOfferToCategory',categoryCtrl.applyCategoryOffer)
admin_route.post('/removeCategoryOffer/:catId',categoryCtrl.removeCategoryOffer)
admin_route.post('/applyOfferToProduct',productCtrl.applyProductOffer)
admin_route.post('/removeProductOffer/:productId',productCtrl.removeProductOffer)

admin_route.get('/brandOffers',brandOfferCtrl.loadBrandOffersList)
admin_route.get('/brandOffers/addBrandOffer',brandOfferCtrl.loadAddBrandOffer)
admin_route.post('/brandOffers/addBrandOffer',brandOfferCtrl.postAddBrandOffer)
admin_route.get('/brandOffers/editBrandOffer/:brandOfferId',brandOfferCtrl.loadEditBrandOffer)
admin_route.post('/brandOffers/editBrandOffer/:brandOfferId',brandOfferCtrl.postEditBrandOffer)
admin_route.get('/brandOffers/cancelBrandOffer/:brandOfferId',brandOfferCtrl.cancelBrandOffer)


module.exports = admin_route;





//Category Size Handling Routes
// admin_route.get('/categories/size-chart/:id',categoryCtrl.loadSizeChart)
// admin_route.post('/categories/size-chart/add-size',categoryCtrl.addSize)
// admin_route.post('/categories/size/edit',categoryCtrl.editSize)
// admin_route.get('/categories/size/delete/:id',categoryCtrl.deleteSize)