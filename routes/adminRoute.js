const express = require('express');
const adminCtrl = require('../controllers/adminCtrl');
const categoryCtrl = require('../controllers/categoryCtrl');
const productCtrl = require('../controllers/productCtrl');
const upload = require('../config/multer');
const auth = require('../middleware/auth')


const admin_route = express.Router()


//Admin Login Handling
admin_route.get('/',auth.isAdminLoggedIn,adminCtrl.loadDashboard)
admin_route.get('/login',adminCtrl.loadAdminLogin);
admin_route.post('/login',adminCtrl.verifyAdminLogin);
admin_route.post('/logout',adminCtrl.logoutAdmin)

//User Handling
admin_route.get('/users',auth.isAdminLoggedIn,adminCtrl.loadUsers)
admin_route.get('/users/block/:id',auth.isAdminLoggedIn,adminCtrl.blockUser)

//Category Handling Routes
admin_route.get('/categories',auth.isAdminLoggedIn,categoryCtrl.loadCategories)
admin_route.post('/categories',auth.isAdminLoggedIn,categoryCtrl.addCategory);
admin_route.post('/categories/edit',auth.isAdminLoggedIn,categoryCtrl.editCategory)
admin_route.get('/categories/list/:id',auth.isAdminLoggedIn,categoryCtrl.listCategory)

//Category Size Handling Routes
// admin_route.get('/categories/size-chart/:id',categoryCtrl.loadSizeChart)
// admin_route.post('/categories/size-chart/add-size',categoryCtrl.addSize)
// admin_route.post('/categories/size/edit',categoryCtrl.editSize)
// admin_route.get('/categories/size/delete/:id',categoryCtrl.deleteSize)

//Product Handling Routes
admin_route.get('/products',auth.isAdminLoggedIn,productCtrl.loadProduct)
admin_route.get('/products/addProduct',auth.isAdminLoggedIn,productCtrl.loadAddProduct)
admin_route.post('/products/addProduct',auth.isAdminLoggedIn,upload.array('image',3),productCtrl.addProductDetails)
admin_route.get('/products/editProduct/:id',auth.isAdminLoggedIn,productCtrl.loadEditProduct)
admin_route.post('/products/editProduct',auth.isAdminLoggedIn,upload.array('image',3),productCtrl.postEditProduct)
admin_route.get('/products/deleteProduct/:id',auth.isAdminLoggedIn,productCtrl.deleteProduct)

admin_route.get('/products/imageDelete/:id',auth.isAdminLoggedIn,productCtrl.deleteImage)


module.exports = admin_route;