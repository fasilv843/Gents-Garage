const express = require('express');
const adminCtrl = require('../controllers/adminCtrl');
const categoryCtrl = require('../controllers/categoryCtrl');
const productCtrl = require('../controllers/productCtrl');
const orderCtrl = require('../controllers/orderCtrl')
const couponCtrl = require('../controllers/couponCtrl')
const upload = require('../config/multer');
const auth = require('../middleware/auth')


const admin_route = express()

admin_route.set('views','./views/admin')


//Admin Login Handling
admin_route.get('/login',adminCtrl.loadAdminLogin);
admin_route.post('/login',adminCtrl.verifyAdminLogin);
admin_route.post('/logout',adminCtrl.logoutAdmin)


admin_route.use('/',auth.isAdminLoggedIn)

//Admin Dashboard
admin_route.get('/',adminCtrl.loadDashboard)



//User Handling
admin_route.get('/users',adminCtrl.loadUsers)
admin_route.get('/users/block/:id',adminCtrl.blockUser)

//Category Handling Routes
admin_route.get('/categories',categoryCtrl.loadCategories)
admin_route.post('/categories',categoryCtrl.addCategory);
admin_route.post('/categories/edit',upload.single('image'),categoryCtrl.editCategory)
admin_route.get('/categories/list/:id',categoryCtrl.listCategory)

//Category Size Handling Routes
// admin_route.get('/categories/size-chart/:id',categoryCtrl.loadSizeChart)
// admin_route.post('/categories/size-chart/add-size',categoryCtrl.addSize)
// admin_route.post('/categories/size/edit',categoryCtrl.editSize)
// admin_route.get('/categories/size/delete/:id',categoryCtrl.deleteSize)

//Product Handling Routes
admin_route.get('/products',productCtrl.loadProduct)
admin_route.get('/products/addProduct',productCtrl.loadAddProduct)
admin_route.post('/products/addProduct',upload.array('image',3),productCtrl.addProductDetails)
admin_route.get('/products/editProduct/:id',productCtrl.loadEditProduct)
admin_route.post('/products/editProduct',upload.array('image',3),productCtrl.postEditProduct)
admin_route.get('/products/deleteProduct/:id',productCtrl.deleteProduct)

admin_route.get('/products/imageDelete/:id',productCtrl.deleteImage)

admin_route.get('/ordersList',orderCtrl.loadOrdersList)
admin_route.post('/changeOrderStatus',orderCtrl.changeOrderStatus)
admin_route.get('/cancelOrder/:orderId',orderCtrl.cancelOrder)
admin_route.get('/approveReturn/:orderId',orderCtrl.approveReturn)

admin_route.get('/coupons',couponCtrl.loadCoupons)
admin_route.get('/coupons/addCoupon',couponCtrl.loadAddCoupon)
admin_route.post('/coupons/addCoupon',couponCtrl.postAddCoupon)
admin_route.get('/coupons/editCoupon/:couponId',couponCtrl.loadEditCoupon)
admin_route.post('/coupons/editCoupon/:couponId',couponCtrl.postEditCoupon)
admin_route.get('/coupons/cancelCoupon/:couponId',couponCtrl.cancelCoupon)

module.exports = admin_route;