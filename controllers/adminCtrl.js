const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')


const loadDashboard = async(req,res) => {
    try {
        res.render('dashboard',{page : 'Dashboard'})
    } catch (error) {
        console.log(error);
    }
}

const loadAdminLogin = async(req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

const verifyAdminLogin = async(req,res) => {
    try {
        const {email, password} = req.body;
        const adminData = await Admin.findOne({email})
        
        if(adminData){
            const passwordMatch = await bcrypt.compare(password, adminData.password)
            if(passwordMatch){
                req.session.adminId = adminData._id;
                res.redirect('/admin')
            }else{
                console.log('Invalid Password');
            }
        }else{
            console.log("This email doesn't exist");
        }

    } catch (error) {
        console.log(error);
    }
}

const logoutAdmin = async(req,res) => {
    try {
        req.session.destroy()
        // req.logout()
        res.clearCookie('adminId')
        res.redirect('/admin')
    } catch (error) {
        console.log();
    }
}

const loadUsers = async(req,res) => { 
    try {
        const userData = await User.find({})
        res.render('users',{userData, page: 'Users'})
    } catch (error) {
        console.log('error');
    }
}

const blockUser = async(req,res) => {
    try {
        const id = req.params.id
        const user = await User.findById({_id:id})
        if(user.isBlocked){
            const userData = await User.findByIdAndUpdate({_id:id},{$set:{isBlocked:false}})
        }else{
            const userData = await User.findByIdAndUpdate({_id:id},{$set:{isBlocked:true}})
        }

        res.redirect('/admin/users')
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadAdminLogin,
    loadDashboard,
    verifyAdminLogin,
    loadUsers,
    blockUser,
    logoutAdmin
}