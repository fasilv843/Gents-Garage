const express = require('express');
const adminCtrl = require('../controllers/adminCtrl');
const categoryCtrl = require('../controllers/categoryCtrl');
const productCtrl = require('../controllers/productCtrl');
const upload = require('../config/multer');


const admin_route = express.Router()


// admin_route.use(express.json())
// admin_route.use(express.urlencoded({extended:false}))

//Admin Login Handling
admin_route.get('/',adminCtrl.loadDashboard)
admin_route.get('/login',adminCtrl.loadAdminLogin);
admin_route.post('/login',adminCtrl.verifyAdminLogin);

//User Handling
admin_route.get('/users',adminCtrl.loadUsers)
admin_route.get('/users/block/:id',adminCtrl.blockUser)

//Category Handling Routes
admin_route.get('/categories',categoryCtrl.loadCategories)
admin_route.post('/categories',categoryCtrl.addCategory);
admin_route.post('/categories/edit',categoryCtrl.editCategory)
admin_route.get('/categories/list/:id',categoryCtrl.listCategory)
// admin_route.get('/categories/delete/:id',categoryCtrl.deleteList)

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


module.exports = admin_route;