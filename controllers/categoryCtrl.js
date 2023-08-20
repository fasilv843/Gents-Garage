const Categories = require('../models/categoryModel');
const Products = require('../models/productModel');
const Offers = require('../models/offerModel')

const loadCategories = async(req, res, next) => {
    try {
        const categories = await Categories.find({}).populate('offer')
        const offerData = await Offers.find({ $or: [
            {status : 'Starting Soon'},
            {status : 'Available' }
        ]});
        res.render('categories',{categories, page:'Categories', offerData})
    } catch (error) {
        next(error);
    }
}

const addCategory = async(req, res, next) => {
    try {
        const categoryName = req.body.categoryName.toUpperCase()
        if(categoryName){

            const isExistCategory = await Categories.findOne({name:categoryName});

            if(isExistCategory){
                console.log('Category Already Exists');
                res.redirect('/admin/categories');
                
            }else{
                await new Categories({name : categoryName}).save()
                res.redirect('/admin/categories');
            }

        }else{
            console.log('Enter Category Name');
            res.redirect('/admin/categories');
        }

    } catch (error) {
                next(error);
    }
}

const editCategory = async(req, res, next) => {
    try {
        console.log('on edit category controller its working!');
        const id = req.body.categoryId
        const newName = req.body.categoryName.toUpperCase()

        const isCategoryExist = await Categories.findOne({name:newName})
        console.log(newName);
        console.log(isCategoryExist);
        console.log(req.file);

        if(req.file){
            const image = req.file.filename
            if(!isCategoryExist || isCategoryExist._id == id){
                await Categories.findByIdAndUpdate({_id:id},{ $set :{ name: newName, image:image } })
            }
        }else{
            if(!isCategoryExist){
                await Categories.findByIdAndUpdate({_id:id},{ $set :{ name: newName } })
            }
        }

        res.redirect('/admin/categories')
    } catch (error) {
                next(error);
    }
}

const listCategory = async(req,res, next) => {
    try {
        const id = req.params.id;
        const categoryData = await Categories.findById({_id:id})

        if(categoryData){
            categoryData.isListed = !categoryData.isListed
            await categoryData.save()
        }
        res.redirect('/admin/categories')

    } catch (error) {
                next(error);
    }
}

const applyCategoryOffer = async(req, res, next) => {
    try {

        const { offerId, categoryId, override } = req.body

        //Setting offerId to offer field of category
        await Categories.findByIdAndUpdate(
            {_id:categoryId},
            {
                $set:{
                    offer: offerId
                }
            }
        );

        const offerData = await Offers.findById({_id:offerId})
        const products = await Products.find({category: categoryId})

        //applying offer to every product in the same category
        for(const pdt of products){

            const actualPrice = pdt.price - pdt.discountPrice;
            
            let offerPrice = 0;
            if(offerData.status == 'Available'){
                offerPrice = Math.round( actualPrice - ( (actualPrice*offerData.discount)/100 ))
            }
    
            if(override){
                await Products.updateOne(
                    { _id: pdt._id },
                    {
                        $set:{
                            offerPrice,
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }else{
                await Products.updateOne(
                    {
                        _id: pdt._id,
                        offer: { $exists: false }
                    },
                    {
                        $set:{
                            offerPrice,
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }

        }

        res.redirect('/admin/categories')

    } catch (error) {
        next(error)
    }
}


const removeCategoryOffer = async(req, res, next) => {
    try {
        const { catId } = req.params

        await Categories.findByIdAndUpdate(
            {_id:catId},
            {
                $unset: {
                    offer:''
                }
            }
        );

        //Unsetting every prodects that matches catId
        await Products.updateMany(
            {
                category: catId,
                offerAppliedBy: 'Category'
            },
            {
                $unset:{
                    offer:'',
                    offerPrice:'',
                    offerAppliedBy:''
                }
            }
        );
        
        res.redirect('/admin/categories')

    } catch (error) {
        next(error)
    }
}


module.exports = {
    
    loadCategories,
    addCategory,
    editCategory,
    listCategory,

    applyCategoryOffer,
    removeCategoryOffer
}









//This code i wrote when i included size for a specific category, 
//but i decided to exclude size field from category. 


// const deleteList = async(req,res) => {
//     try {
//         const id = req.params.id;
//         await Categories.findByIdAndDelete({_id:id})
//         res.redirect('/admin/categories')
//     } catch (error) {
//                 next(error);
//     }
// }

//Size handling in categories in removed :)

// const loadSizeChart = async(req,res) => {
//     try {
//         const id = req.params.id;
//         const sizeData = await Categories.findById({_id:id});
//         res.render('admin/size-chart',{ sizeData, id , page:'Categories'});
//     } catch (error) {
//                 next(error);
//     }
// }

// const addSize = async(req,res) => {
//     try {
//         const {id, size} = req.body;
//         await Categories.findByIdAndUpdate({_id:id},{$addToSet:{sizes:size}})
//         res.redirect('/admin/categories')
//     } catch (error) {
//                 next(error);
//     }
// }
 
// const editSize = async(req,res) => {
//     try {
//         console.log('editSize loaded');
//         const id = req.body.sID
//         const oldSize = req.body.sVal
//         const newSize = req.body.newName

//         const isSizeExist = await Categories.findOne({_id:id, sizes: newSize})

//         if(isSizeExist){
//             const categories = await Categories.find({})
//             let message = 'Size already exists'
//             return res.render('admin/categories', { message, categories, page: 'Categories' })
//         }

//         await Categories.findOneAndUpdate({ _id: id, sizes: oldSize }, { $set:{ 'sizes.$': newSize }})
//         res.redirect('/admin/categories');

//     } catch (error) {
//                 next(error);
//     }
// }


// const deleteSize = async(req,res) => {
//     try {
//         console.log('deleteSize loaded');
//         const id = req.params.id;
//         const sizeVal = req.query.sizeValue;
//         await Categories.findByIdAndUpdate({ _id:id },{ $pull:{ sizes: sizeVal }})
//         res.redirect('/admin/categories');
//     } catch (error) {
//                 next(error);
//     }
// }
