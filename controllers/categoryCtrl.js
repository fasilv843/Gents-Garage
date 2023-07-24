const Categories = require('../models/categoryModel');

const loadCategories = async(req,res) => {
    try {
        const categories = await Categories.find({})
        res.render('admin/categories',{categories, page:'Categories'})
    } catch (error) {
        console.log(error);
    }
}

const addCategory = async(req,res) => {
    try {
        const categoryName = req.body.categoryName.toUpperCase()
        console.log(categoryName);
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
        console.log(error);
    }
}

const editCategory = async(req,res) => {
    try {
        const id = req.body.categoryId
        const newName = req.body.categoryName.toUpperCase()
        console.log(newName);
        await Categories.findByIdAndUpdate({_id:id},{ $set :{ name: newName } })
        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error);
    }
}

const listCategory = async(req,res) => {
    try {
        const id = req.params.id;
        const categoryData = await Categories.findById({_id:id})

        if(categoryData){
            if(categoryData.isListed === true){
                await Categories.findByIdAndUpdate({_id:id},{$set:{isListed:false}})
            }else{
                await Categories.findByIdAndUpdate({_id:id},{$set:{isListed:true}})
            }
            res.redirect('/admin/categories')
        }

    } catch (error) {
        console.log(error);
    }
}

//This code i wrote when i included size for a specific category, 
//but i decided to exclude size field from category. 


// const deleteList = async(req,res) => {
//     try {
//         const id = req.params.id;
//         await Categories.findByIdAndDelete({_id:id})
//         res.redirect('/admin/categories')
//     } catch (error) {
//         console.log(error);
//     }
// }

//Size handling in categories in removed :)

// const loadSizeChart = async(req,res) => {
//     try {
//         const id = req.params.id;
//         const sizeData = await Categories.findById({_id:id});
//         res.render('admin/size-chart',{ sizeData, id , page:'Categories'});
//     } catch (error) {
//         console.log(error);
//     }
// }

// const addSize = async(req,res) => {
//     try {
//         const {id, size} = req.body;
//         await Categories.findByIdAndUpdate({_id:id},{$addToSet:{sizes:size}})
//         res.redirect('/admin/categories')
//     } catch (error) {
//         console.log(error);
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
//         console.log(error);
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
//         console.log(error);
//     }
// }

module.exports = {
    
    loadCategories,
    addCategory,
    editCategory,
    listCategory




    // deleteList
    // loadSizeChart,
    // addSize,
    // editSize,
    // deleteSize
}