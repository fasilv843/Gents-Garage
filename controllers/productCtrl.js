const Products = require('../models/productModel')
const Categories = require('../models/categoryModel');
const fs = require('fs')
const path = require('path')

const loadProduct = async(req,res) => {
    try {
        const pdtsData = await Products.find().populate("category")
        // console.log(pdtsData);
        res.render('admin/products',{pdtsData, page:'Products'})
    } catch (error) {
        console.log(error);
    }
}

const loadAddProduct = async(req,res) => {
    try {
        const categories = await Categories.find({})
        res.render('admin/addProduct',{categories, page:'Products'})
    } catch (error) {
        console.log(error);
    }
}

const addProductDetails = async(req,res) => {
    try {
        const { 
            brand, productName, category,
            check1, check2, check3, check4, check5, check6,
            quantity, price, dprice, description,
        } = req.body
        // console.log(req)
        console.log(req.files);

        let images = []
        for(let file of req.files){
            images.push(file.filename)
        }

        let size = []
        if(check1) size.push(check1)
        if(check2) size.push(check2)
        if(check3) size.push(check3)
        if(check4) size.push(check4)
        if(check5) size.push(check5)
        if(check6) size.push(check6)

        const catData = await Categories.find({name: category});
        console.log(catData);
        const prodData = await new Products({
            brand, name:productName, description, category : catData[0]._id,
            size, price, discountPrice: dprice, quantity , images
        }).save();
        
         res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
    }
}

const loadEditProduct = async(req,res) => {
    try {
        const id = req.params.id;
        const pdtData = await Products.findById({_id:id}).populate('category')
        const catData = await Categories.find({})
        // console.log(pdtData);
        // console.log(catData);
        res.render('admin/editProduct',{pdtData, catData, page: 'Products'})

    } catch (error) {
        console.log(error);
    }
}

const postEditProduct = async(req,res) => {
    try {
        const { 
            id, productName, category,
            check1, check2, check3, check4, check5, check6,
            quantity, price, dprice, description,
        } = req.body

        const brand = req.body.brand.toUpperCase()

        let sizes = []
        if(check1) sizes.push(check1)
        if(check2) sizes.push(check2)
        if(check3) sizes.push(check3)
        if(check4) sizes.push(check4)
        if(check5) sizes.push(check5)
        if(check6) sizes.push(check6)

        if (req.files) {
            let newImages = []
            for (let file of req.files) {
                newImages.push(file.filename)
            }
            console.log('id : '+id);
            await Products.findOneAndUpdate({ _id: id }, { $push: { images: { $each: newImages } } })
        }

        console.log('category : '+category);
        const catData = await Categories.findOne({ name: category })
        console.log(catData);
        await Products.findByIdAndUpdate(
            { _id: id },
            {
                $set:{
                    brand, name:productName, category:catData._id, sizes, quantity,
                    description, price, discountPrice: dprice
                }
            }
        )

        res.redirect('/admin/products')

    } catch (error) {
        console.log(error);
    }
}

const deleteProduct = async(req,res) => {
    try {
        const id = req.params.id;
        const prodData = await Products.findById({_id:id})
        
        console.log(prodData);
        if(prodData.isListed){
            await Products.findByIdAndUpdate({_id:id}, {$set:{ isListed: false }});
        }else{
            await Products.findByIdAndUpdate({_id:id}, {$set:{ isListed: true }});
        }
        
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error);
    }
}

const deleteImage = async(req,res) => {
    try {
        const id = req.params.id;
        const imageURL = req.query.imageURL;

        await Products.findOneAndUpdate( { _id: id }, {$pull:{ images : imageURL }})


        console.log('imageURL :  '+imageURL+'type :'+typeof imageURL);

        const imgFolder = path.join(__dirname,'../public/productImages')
        // console.log(imgFolder);

        const files = fs.readdirSync(imgFolder);

        for (const file of files) {
            console.log('file : '+file);
            console.log('imageURL : '+imageURL);
            if(file === imageURL){
                const filePath = path.join(imgFolder, file);
                fs.unlinkSync(filePath);
                console.log('deleted '+filePath);
                break;
            }
        }
        
        
        res.redirect(`/admin/products/editProduct/${id}`)

    } catch (error) {
        console.log(error);
    }
}

const loadShop = async(req,res) => {
    try {

        const isLoggedIn = req.session.userId

        const pdtsData = await Products.find({isListed:true})
        // console.log(pdtsData);
        res.render('user/shop',{pdtsData, page:'Shop',isLoggedIn})
    } catch (error) {
        console.log(error);
    }
}

const loadProductOverview = async(req,res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const isLoggedIn = Boolean(req.session.userId)
        const pdtData = await Products.findById({_id:id})
        res.render('user/productOverview',{pdtData, parentPage : 'Shop', page: 'Product Overview',isLoggedIn})
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    loadProduct,
    loadAddProduct,
    addProductDetails,
    loadEditProduct,
    postEditProduct,
    deleteProduct,
    deleteImage,
    loadShop,
    loadProductOverview
}