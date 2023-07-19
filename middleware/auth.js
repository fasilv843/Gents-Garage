
const isUserLoggedIn = (req, res, next) => {
    try {

        if(!req.session.userId){
            res.redirect('/login')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isAdminLoggedIn = (req, res, next) => {
    try {
        
        if(!req.session.adminId){
            res.redirect('/admin/login')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isUserLoggedOut = (req, res, next) => {
    try {
        
        if(req.session.userId){
            res.redirect('/')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isAdminLoggedOut = (req, res, next) => {
    try {
                
        if(req.session.adminId){
            res.redirect('/admin')
        }
        next();
       
    } catch (error) {
        console.log(error);
    }
}

module.exports = {

    isUserLoggedIn,
    isUserLoggedOut,

    isAdminLoggedIn,
    isAdminLoggedOut

}