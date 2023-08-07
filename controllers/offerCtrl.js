const Offers = require('../models/offerModel');

const loadOffer = async(req, res) => {
    try {
        console.log('loading offer');
        const offers = await Offers.find({})
        res.render('offers',{page:'Offers', offers})
    } catch (error) {
        console.log(error);
    }
}

const loadAddOffer = async(req, res, next) => {
    try {
        console.log('loading add offer');
        res.render('addOffer',{ page: 'Offers' })
    } catch (error) {
        next(error)
    }
}


const postAddOffer = async(req, res, next) => {
    try {
        console.log('posting add offer');
        const { discount, startingDate, expiryDate } = req.body
        const name = req.body.name.toUpperCase()

        isOfferExists = await Offers.findOne({name})

        if(isOfferExists){
            console.log('Offer already exist');

            return res.redirect('/admin/offers/addOffer')
        }

        
        if(new Date(startingDate) >= new Date(expiryDate) || new Date(expiryDate) < new Date() ){
            console.log('starting cannot be equal or greater than expiry date');
            return res.redirect('/admin/offers/addOffer')
        }

        let status;
        if(new Date(startingDate) <= new Date()){
            status = 'Available'
        }else if(new Date(startingDate) > new Date()){
            status = 'Starting Soon'
        }
        console.log(status);

        await new Offers({ name, discount, startingDate, expiryDate, status }).save();

        res.redirect('/admin/offers')

    } catch (error) {
        next(error)
    }
}

const loadEditOffer = async(req, res, next) => {
    try {
        console.log('loading edit offer');

        const offerId = req.params.offerId;
        const offerData = await Offers.findById({ _id: offerId })
        res.render('editOffer',{offerData, page:'Offers'});

    } catch (error) {
        next(error)
    }
}


const postEditOffer = async(req, res, next) => {
    try {
        console.log('posting edit offer');
        const offerId = req.params.offerId
        const { discount, startingDate, expiryDate } = req.body
        const name = req.body.name.toUpperCase()

        const isOfferExists = await Offers.findOne({name})

        if(isOfferExists && isOfferExists._id != offerId){
            console.log('Offer Already Exist');
            return res.redirect(`/admin/editOffer/${offerId}`)
        }

        if(new Date(startingDate) >= new Date(expiryDate) || new Date(expiryDate) < new Date() ){
            console.log('starting cannot be equal or greater than expiry date');
            return res.redirect(`/admin/editOffer/${offerId}`)
        }

        let status;
        if(new Date(startingDate) <= new Date()){
            status = 'Available'
        }else if(new Date(startingDate) > new Date()){
            status = 'Starting Soon'
        }

        await Offers.findByIdAndUpdate( {_id:offerId},
            {
                $set:{
                    name, discount, startingDate, expiryDate, status
                }
            }
        );
        
        res.redirect('/admin/offers')

    } catch (error) {
        next(error)
    }
}


const cancelOffer = async(req, res, next) => {
    try {
        const offerId = req.params.offerId;

        const offerData = await Offers.findById({_id:offerId})
        if(offerData.status === 'Cancelled'){

            const startingDate = offerData.startingDate
            const expiryDate = offerData.expiryDate

            if( new Date(expiryDate) < new Date()){
                return res.redirect('/admin/offers')
            }
            
            let status;
            if(new Date(startingDate) <= new Date()){
                status = 'Available'
            }else if(new Date(startingDate) > new Date()){
                status = 'Starting Soon'
            }

            await Offers.findByIdAndUpdate(
                {_id: offerId},
                {
                    $set:{ status }
                }
            );

        }else{

            await Offers.findByIdAndUpdate(
                {_id: offerId},
                {
                    $set:{
                        status : 'Cancelled'
                    }
                }
            );

        }

        res.redirect('/admin/offers')
    } catch (error) {
        next(error)
    }
}


module.exports = {
    loadOffer,
    loadAddOffer,
    loadEditOffer,

    postAddOffer,
    postEditOffer,

    cancelOffer
}