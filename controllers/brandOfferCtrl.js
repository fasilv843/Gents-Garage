const BrandOffers = require('../models/brandOfferModel')
const Products = require('../models/productModel')
const Categories = require('../models/categoryModel')

const loadBrandOffersList = async(req, res, next) => {
    try {
        const brandOffers = await BrandOffers.find()
        res.render('brandOffers',{ page: 'Brand Offers', brandOffers })
    } catch (error) {
        next(error)
    }
}

const loadAddBrandOffer = async(req, res, next) => {
    try {
        console.log('load add brand offer');
        const categories = await Categories.find({ isListed: true })
        let brands = await Products.aggregate([
            {
                $group: { 
                    _id: '$brand'
                }
            }
        ]);

        brands = brands.map((brand) => brand._id)

        
        res.render('addBrandOffer',{ page: 'Brand Offers', categories, brands })
    } catch (error) {
        next(error)
    }
}

const postAddBrandOffer = async(req, res, next) => {
    try {
        console.log('post add brand offer');
        const { discount, expiryDate} = req.body
        const name = req.body.name.toUpperCase()
        const brand = req.body.brand.toUpperCase()
        const category = req.body.category
        console.log(category);

        const brandOfferData = await new BrandOffers({
            name, brand,
            discount, expiryDate,
            categoryId: category,
            status: 'Available'
        }).save()

        const products = await Products.find(
            {
                brand, category
            }
        );

        console.log(products);

        for(const pdt of products){

            const actualPrice = pdt.price - pdt.discountPrice;
            const offerPrice = Math.round( actualPrice - ( (actualPrice*discount)/100 ))

            pdt.offer = brandOfferData._id;
            pdt.offerType = 'BrandOffers';
            pdt.offerPrice = offerPrice;
            pdt.offerAppliedBy = 'Brand Offer';

        }

        res.redirect('/admin/brandOffers');

    } catch (error) {
        next(error)
    }
}


const loadEditBrandOffer = async(req, res, next) => {
    try {
        console.log('load edit brand offer');
        const { brandOfferId } = req.params

        const categories = await Categories.find({ isListed: true })
        let brands = await Products.aggregate([
            {
                $group: { 
                    _id: '$brand'
                }
            }
        ]);

        brands = brands.map((brand) => brand._id)

        const brandOffer = await BrandOffers.findById({ _id: brandOfferId });

        res.render('editBrandOffer',{ page: 'Brand Offers', brandOffer, categories, brands })
    } catch (error) {
        next(error)
    }
}

const postEditBrandOffer = async(req, res, next) => {
    try {
        console.log('post edit brand offer');
        const { brandOfferId } = req.params
        const { discount, expiryDate} = req.body
        const name = req.body.name.toUpperCase()
        const brand = req.body.brand.toUpperCase()
        const category = req.body.category

        await BrandOffers.findByIdAndUpdate(
            { _id : brandOfferId },
            {
                $set:{
                    name, brand, discount, expiryDate, categoryId: category
                }
            }
        );

        const products = await Products.find(
            {
                brand, category
            }
        );

        console.log(products);

        for(const pdt of products){

            const actualPrice = pdt.price - pdt.discountPrice;
            const offerPrice = Math.round( actualPrice - ( (actualPrice*discount)/100 ))

            pdt.offer = brandOfferId;
            pdt.offerType = 'BrandOffers';
            pdt.offerPrice = offerPrice;
            pdt.offerAppliedBy = 'Brand Offer';

        }

        res.redirect('/admin/brandOffers')

    } catch (error) {
        next(error)
    }
}

const removeBrandOffer = async( req, res, next ) => {
    try {
        const { brandOfferId } = req.params
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadBrandOffersList,
    loadAddBrandOffer,
    loadEditBrandOffer,
    postAddBrandOffer,
    postEditBrandOffer
}