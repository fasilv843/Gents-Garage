const Products = require('../models/productModel')
const Categories = require('../models/categoryModel');
const fs = require('fs')
const path = require('path')

const loadProduct = async(req,res) => {
    try {
        const pdtsData = await Products.find().populate("category")
        // console.log(pdtsData);
        res.render('products',{pdtsData, page:'Products'})
    } catch (error) {
        console.log(error);
    }
}

const loadAddProduct = async(req,res) => {
    try {
        const categories = await Categories.find({})
        res.render('addProduct',{categories, page:'Products'})
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
            size, price, discountPrice: dprice, quantity , images, createdAt : new Date()
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
        res.render('editProduct',{pdtData, catData, page: 'Products'})

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
        
        res.redirect(`/admin/products/editProduct/${id}`);

    } catch (error) {
        console.log(error);
    }
}

const loadShop = async(req,res) => {
    try {

        const isLoggedIn = req.session.userId

        console.log('req.query.page : '+req.query.page);
        console.log('req.query.brand : '+req.query.brand);
        console.log('req.query.sortValue : '+req.query.sortValue);
        console.log('req.query.minPrice : '+req.query.minPrice);
        console.log('req.query.maxPrice : '+req.query.maxPrice);
        console.log('req.query.category : '+req.query.category);
        // console.log('req.query.page : '+req.query.page);

        let page = 1;
        if(req.query.page){
            page = req.query.page
        }

        let limit = 3;
        let sortValue = -1;
        if(req.query.sortValue){
            if(req.query.sortValue == 2){
                sortValue = 1;
            }else{
                sortValue = -1;
            }
        }

        //declaring a default min and max price
        let minPrice = 1;
        let maxPrice = Number.MAX_VALUE;
        console.log('type of minPrice : '+typeof req.query.minPrice);
        console.log('type of maxPrice : '+typeof req.query.maxPrice);
        //changing min and max prices to filter by price

        if(req.query.minPrice && parseInt(req.query.minPrice)){
            minPrice =  parseInt(req.query.minPrice);
        }
        if(req.query.maxPrice && parseInt(req.query.maxPrice)){
            maxPrice =  parseInt(req.query.maxPrice);
        }


        let search = '';
        if(req.query.search){
            search = req.query.search
        }

        //finding all categories that matches the search query
        async function getCategoryIds(search){
            const categories = await Categories.find(
                {
                    name:{
                        $regex: '.*' +search+'.*',
                        $options: 'i'
                    }
                }
            );
            return categories.map(category => category._id)
        }



        //Declaring a common query object to find products
        const query = {
            isListed: true,
            $or: [
                {
                    name:{
                        $regex: '.*' + search + '.*',
                        $options: 'i'
                    }
                },
                {
                    brand:{
                        $regex: '.*' + search + '.*',
                        $options: 'i'
                    }
                }
            ],
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        }

        if(req.query.search){
            search = req.query.search;
            console.log('req.query.search : '+req.query.search);
            query.$or.push({
                'category' : {
                    $in: await getCategoryIds(search)
                }
            });
        };

        //add category to query to filter based on category
        if(req.query.category){
            query.category = req.query.category
        };

        //add category to query to filter based on brand
        if(req.query.brand){
            query.brand = req.query.brand
        };
        console.log('req.query.brand : '+req.query.brand);

        console.log(query);

        let pdtsData = await Products.find(query).populate('category').sort({ createdAt: -1 }).limit(limit*1).skip( (page - 1)*limit );

        // if(req.query.sortValue && req.query.sortValue != 3){
        //     pdtsData = await Products.find(query).populate('category').sort({ discountPrice: sortValue }).limit(limit*1).skip( (page - 1)*limit )
        // }else{
        //     pdtsData = await Products.find(query).populate('category').sort({ createdAt: sortValue }).limit(limit*1).skip( (page - 1)*limit )
        // }

        console.log('pdtsData : \n\n'+pdtsData);

        const categoryNames = await Categories.find({})

        console.log('categoryNames : \n\n'+categoryNames);
        const brands = await Products.aggregate([{
                $group: {
                    _id: '$brand'
                }
        }]);

        let totalProductsCount = await Products.find(query).count()
        let pageCount = Math.ceil(totalProductsCount / limit)

        let removeFilter = 'false'
        if(req.query){
            if(req.query.page){
                removeFilter = 'false'
            }else{
                removeFilter = 'true'
            }
        };

        res.render('shop',{
            pdtsData,
            userId: req.session.userId,
            categoryNames,
            brands,
            pageCount,
            currentPage: page,
            sortValue: req.query.sortValue,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            category: req.query.category,
            brand: req.query.brand,
            removeFilter,
            search: req.query.search,
            isLoggedIn,
            page:'Shop'
        });

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
        res.render('productOverview',{pdtData, parentPage : 'Shop', page: 'Product Overview',isLoggedIn})
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