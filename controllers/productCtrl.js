const Products = require('../models/productModel')
const Categories = require('../models/categoryModel');
const Offers = require('../models/offerModel')
const User = require('../models/userModel')
const Orders =  require('../models/orderModel')
const fs = require('fs')
const path = require('path')

const loadProduct = async( req, res, next) => {
    try {
        const pdtsData = await Products.find().populate("category").populate('offer')

        const offerData = await Offers.find({ $or: [
            {status : 'Starting Soon'},
            {status : 'Available' }
        ]});
        res.render('products',{pdtsData, offerData, page:'Products'})
    } catch (error) {
        next(error);
    }
}

const loadAddProduct = async( req, res, next) => {
    try {
        const categories = await Categories.find({ isListed: true })
        res.render('addProduct',{categories, page:'Products'})
    } catch (error) {
                next(error);
    }
}

const addProductDetails = async( req, res, next ) => {
    try {
        const { 
            brand, productName, category,
            check1, check2, check3, check4, check5, check6,
            quantity, price, dprice, description,
        } = req.body

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
                next(error);
    }
}

const loadEditProduct = async(req, res ,next) => {
    try {
        const id = req.params.id;
        const pdtData = await Products.findById({_id:id}).populate('category')
        const catData = await Categories.find({ isListed: true })

        res.render('editProduct',{pdtData, catData, page: 'Products'})

    } catch (error) {
        next(error);
    }
}

const postEditProduct = async(req, res, next) => {
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
                next(error);
    }
}

const deleteProduct = async( req, res, next) => {
    try {
        const id = req.params.id;
        const prodData = await Products.findById({_id:id})
        prodData.isListed = !prodData.isListed
        prodData.save()
        
        res.redirect('/admin/products');
    } catch (error) {
                next(error);
    }
}

const deleteImage = async(req,res, next) => {
    try {
        const id = req.params.id;
        const imageURL = req.query.imageURL;

        await Products.findOneAndUpdate( { _id: id }, {$pull:{ images : imageURL }})


        console.log('imageURL :  '+imageURL+'type :'+typeof imageURL);

        const imgFolder = path.join(__dirname,'../public/images/productImages')

        const files = fs.readdirSync(imgFolder);

        for (const file of files) {

            if(file === imageURL){
                const filePath = path.join(imgFolder, file);
                fs.unlinkSync(filePath);
                break;
            }
        }
        
        res.redirect(`/admin/products/editProduct/${id}`);

    } catch (error) {
                next(error);
    }
}

const loadShop = async(req,res, next) => {
    try {

        const isLoggedIn = Boolean(req.session.userId);

        let page = 1;
        if(req.query.page){
            page = req.query.page
        }

        let limit = 6;

        //declaring a default min and max price
        let minPrice = 1;
        let maxPrice = Number.MAX_VALUE;

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

        let sortValue = 1;
        if(req.query.sortValue){
            sortValue = req.query.sortValue;
        }


        let pdtsData;
        if(sortValue == 1){
            pdtsData = await Products.find(query).populate('category').populate('offer').sort({ createdAt: -1 }).limit(limit*1).skip( (page - 1)*limit );

        }else{

            pdtsData = await Products.find(query).populate('category').populate('offer')

            pdtsData.forEach(((pdt) => {
                if (pdt.offerPrice) {
                    pdt.actualPrice = pdt.offerPrice
                    console.log(pdt.actualPrice);
                } else {
                    pdt.actualPrice = pdt.price - pdt.discountPrice
                }
            }))

            if(sortValue == 2){
                //sorting ascending order of actualPrice
                pdtsData.sort( (a,b) => {
                    return a.actualPrice - b.actualPrice;
                });

            }else if(sortValue == 3){

                //sorting descending order of actualPrice
                pdtsData.sort( (a,b) => {
                    return b.actualPrice - a.actualPrice;
                });

            }

            pdtsData = pdtsData.slice((page - 1) * limit, page * limit);

        }

        const categoryNames = await Categories.find({})
        const brands = await Products.aggregate([{
                $group: {
                    _id: '$brand'
                }
        }]);

        let totalProductsCount = await Products.find(query).count()
        let pageCount = Math.ceil(totalProductsCount / limit)

        let removeFilter = 'false'
        if(req.query && !req.query.page){
            removeFilter = 'true'
        };

        let userData;
        let wishlist;
        let cart;
        if(req.session.userId){
            userData = await User.findById({_id:req.session.userId})
            wishlist = userData.wishlist;
            cart = userData.cart.map(item => item.productId.toString())
        }

        res.render('shop',{
            pdtsData,
            userId: req.session.userId,
            categoryNames,
            brands,
            pageCount,
            currentPage: page,
            sortValue,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            category: req.query.category,
            brand: req.query.brand,
            removeFilter,
            search: req.query.search,
            wishlist,
            cart,
            isLoggedIn,
            page:'Shop'
        });

    } catch (error) {
                next(error);
    }
}

const loadProductOverview = async(req,res, next) => {
    try {
        const id = req.params.id;
        const userId = req.session.userId
        const isLoggedIn = Boolean(userId)
        const pdtData = await Products.findById({_id:id}).populate('reviews.userId')

        let isPdtExistInCart = false;
        let isPdtAWish = false;
        let isUserReviewed = false;
        if(userId){
            const userData = await User.findById({_id:userId})
            const wishlist = userData.wishlist;
            if(wishlist.find((productId) => productId == id ) > -1){
                isPdtAWish = true;
            }

            userData.cart.forEach((pdt) => {
                if(pdt.productId == id){
                    isPdtExistInCart = true
                }
            })

            pdtData.reviews.forEach((review) => {
                if(review.userId._id == userId){
                    isUserReviewed = true;
                }
            });
        }

        res.render('productOverview',{pdtData, parentPage : 'Shop', page: 'Product Overview',isLoggedIn, isPdtAWish, isPdtExistInCart, isUserReviewed})
    } catch (error) {
                next(error);
    }
}

const loadAddReview = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session
        let isPdtPurchased = false
        const isLoggedIn = Boolean(req.session.userId)
        const orderData = await Orders.findOne({ userId, 'products.productId': productId })
        if(orderData) isPdtPurchased = true

        res.render('addReview',{page:'Reviews', parentPage:'Shop',isPdtPurchased, productId, userId, isLoggedIn})
    } catch (error) {
        next(error)
    }
}

const postAddReview = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session
        const { rating, title, description } = req.body

        await Products.updateOne(
            {_id:productId},
            {
                $push:{
                    reviews:{
                        userId, title, rating, description, createdAt: new Date()
                    }
                }
            }
        );

        const pdtData = await Products.findById({_id:productId})
        const totalRating = pdtData.reviews.reduce((sum, review) => sum += review.rating, 0)
        const avgRating = Math.floor(totalRating/pdtData.reviews.length)

        await Products.updateOne(
            {_id:productId},
            {
                $set:{
                    totalRating: avgRating
                }
            }
        );

        res.redirect(`/shop/productOverview/${productId}`)
    } catch (error) {
        next(error)
    }
}

const loadEditReview = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session;
        const isLoggedIn = Boolean(userId)
        const pdtData = await Products.findOne(
            {
                _id:productId,
                reviews:{
                    $elemMatch: { userId }
                }
            }
        ).populate('reviews.userId');

        const reviewData = pdtData.reviews.find((review) => review.userId._id == userId)
        res.render('editReview',{ reviewData, productId, isLoggedIn, page:'Edit Review', parentPage: 'Shop' })
    } catch (error) {
        next(error)
    }
}

const postEditReview = async(req, res, next) => {
    try {

        const { productId } = req.params
        const { reviewId }  = req.query
        const { rating, title, description } = req.body

        await Products.updateOne(
            {_id:productId, 'reviews._id': reviewId },
            {
                $set:{
                    'reviews.$.rating' : rating,
                    'reviews.$.title' : title,
                    'reviews.$.description' : description
                }
            }
        );
        
        const pdtData = await Products.findById({_id:productId})
        const totalRating = pdtData.reviews.reduce((sum, review) => sum += review.rating, 0)
        const avgRating = Math.floor(totalRating/pdtData.reviews.length)

        await Products.updateOne(
            {_id:productId},
            {
                $set:{
                    totalRating: avgRating
                }
            }
        );
        
        res.redirect(`/shop/productOverview/${productId}`)
    } catch (error) {
        next(error)
    }
}

const loadAllReviews = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { userId } = req.session
        const isLoggedIn = Boolean(userId)
        const pdtData = await Products.findById({_id: productId})
        res.render('showReviews',{pdtData, userId, page:'Reviews', parentPage:'Shop', isLoggedIn})
    } catch (error) {
        next(error)
    }
}

const applyProductOffer = async(req, res, next) => {
    try {
        const { offerId, productId } = req.body

        const product = await Products.findById({_id:productId})
        const offerData = await Offers.findById({_id:offerId})
        const actualPrice = product.price - product.discountPrice;
        
        let offerPrice = 0;
        if(offerData.status == 'Available'){
            offerPrice = Math.round( actualPrice - ( (actualPrice*offerData.discount)/100 ))
        }

        await Products.findByIdAndUpdate(
            {_id:productId},
            {
                $set:{
                    offerPrice,
                    offerType: 'Offers',
                    offer: offerId,
                    offerAppliedBy: 'Product'
                }
            }
        )

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
    }
}

const removeProductOffer = async(req, res, next) => {
    try {
        const { productId } = req.params
        await Products.findByIdAndUpdate(
            {_id: productId},
            {
                $unset:{
                    offer:'',
                    offerType: '',
                    offerPrice:'',
                    offerAppliedBy:''
                }
            }
        );

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
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
    loadProductOverview,
    applyProductOffer,
    removeProductOffer,
    loadAddReview,
    loadEditReview,
    postAddReview,
    postEditReview,
    loadAllReviews
}