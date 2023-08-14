const fs = require('fs')
const path = require('path')
const Banners = require('../models/bannerModal');

const loadBannerList = async(req, res, next) => {
    try {
        console.log('banner list loaded');
        const bannerLimit = 3;
        const banners = await Banners.find({})
        res.render('banner',{page:'Banners', banners, bannerLimit})
    } catch (error) {
        next(error)
    }
}

const addBanner = async(req, res, next) => {
    try {
        const { heading, url } = req.body;
        const image = req.file.filename

        await new Banners({
            heading, url, image
        }).save();

        res.redirect('/admin/banners')
        
    } catch (error) {
        next(error)
    }
}

const UpdateBanner = async(req, res, next) => {
    try {

        console.log('updating banner');

        const bannerId = req.params.bannerId
        const { heading, url } = req.body;

        let image = false;
        if(req.file){
            image = req.file.filename
        }

        if(image){

            const bannerData = await Banners.findById({_id: bannerId})

            fs.unlink(path.join(__dirname,'../public/images/bannerImages/', bannerData.image), (err) => {
                if(err) next(err)
            });

            await Banners.findByIdAndUpdate(
                {_id: bannerId},
                {
                    $set:{
                        heading, image , url
                    }
                }    
            );

        }else{
            
            await Banners.findByIdAndUpdate(
                {_id: bannerId},
                {
                    $set:{
                        heading, url
                    }
                }    
            );
        }

        res.redirect('/admin/banners');

    } catch (error) {
        next(error)
    }
}

const deleteBanner = async(req, res, next) => {
    try {

        const bannerId = req.params.bannerId;

        const bannerData = await Banners.findById({_id: bannerId})
        
        //Deleting image from bannerImages
        fs.unlink(path.join(__dirname,'../public/images/bannerImages/', bannerData.image), (err) => {
            if(err) next(err)
        });

        //Deleting banner document
        await Banners.findByIdAndDelete({_id:bannerId})

        res.redirect('/admin/banners')

    } catch (error) {
        next(error)
    }
}




module.exports = {
    loadBannerList,
    addBanner,
    UpdateBanner,
    deleteBanner
}