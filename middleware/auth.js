
const User = require('../models/userModel')


const isUserLoggedIn = (req, res, next) => {
    try {

        if(!req.session.userId){
            return res.redirect('/login')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isUserBlocked = async(req, res, next) => {
    try {

        // console.log('in is UserBlocked middleware');
        // console.log(req.session.userId);

        if(req.session.userId){
            // console.log(req.session);
            const userData = await User.findById({_id : req.session.userId})
            
            let isUserBlocked = userData.isBlocked
            // console.log('isUserBlocked : '+isUserBlocked);
            if(isUserBlocked){
                req.session.destroy()
                // console.log('session after destroying');
                // console.log(req.session);
                req.app.locals.message = 'You are blocked by admin';
                
                return res.redirect('/login')
            }

        }
        // console.log('calling next()');
        next();

    } catch (error) {
        console.log(error);
    }
}

// const USER = require('../models/user')

// const loggedIn = async (req, res, next) => {
//     try {
//         if (req.session.user) {
//             const userId = req.session.user._id
//             const userData = await USER.findOne({ _id: userId })
//             if (userData.status) {
//                 next()
//             } else {
//                 req.session.destroy()
//                 req.app.locals.specialContext = 'You have been blocked by the admin'
//                 return res.redirect('/login')
//             }
//         } else {
//             return res.redirect('/login')
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const isAdminLoggedIn = (req, res, next) => {
    try {
        
        if(!req.session.adminId){
            return res.redirect('/admin/login')
        }
        next();

    } catch (error) {
        console.log('Error occured on isAdminloggedIn middleware');
        console.log(error);
    }
}

module.exports = {
    isUserLoggedIn,
    isAdminLoggedIn,
    isUserBlocked
}