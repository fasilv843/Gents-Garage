
const isLoggedIn = (req, res, next) => {
    try {

        if(req.session.userId){
            return true
        }else{
            return false
        }

        next();

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isLoggedIn
}