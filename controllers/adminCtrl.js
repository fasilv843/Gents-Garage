const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel')
const User = require('../models/userModel');
const Orders  = require('../models/orderModel');

const findIncome = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        console.log(startDate, endDate);
        let income = await Orders.aggregate([
            { 
                $match: { 
                    status: 'Delivered',
                    date:{
                        $gte: startDate,
                        $lt: endDate 
                    }
                } 
            },
            { 
                $group: {
                    _id: null,
                    totalIncome : {$sum : '$totalPrice'}
                }
            }
        ]);

        return income.length ? income[0].totalIncome : 0;

    } catch (error) {
        console.log(error);
    }
}


const loadDashboard = async(req,res) => {
    try {
        //Setting Dates Variables
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const jan1OfTheYear =  new Date(today.getFullYear(), 0, 1);
        
        const totalIncome = await findIncome()
        const thisMonthIncome = await findIncome(firstDayOfMonth)
        const thisYearIncome = await findIncome(jan1OfTheYear)

        const totalUsersCount = await User.find({}).count()
        const usersOntheMonth = await User.find({ doj:{ $gte: firstDayOfMonth }}).count()

        const totalSalesCount = await Orders.find({ status: 'Delivered' }).count()
        const salesOnTheYear = await Orders.find({ status: 'Delivered', createdAt:{ $gte: jan1OfTheYear } }).count()
        
        let salesYear = 2023;
        if(req.query.salesYear){
            salesYear = parseInt(req.query.salesYear)
        }

        const totalYears = await Orders.aggregate([
            { $group: { _id: { createdAt:{ $dateToString: {format: '%Y', date: '$createdAt'}}}}},
            { $sort: {'_id:createdAt': -1 }}
        ]);

        const displayYears = [];  //use map if possible
        console.log(totalYears);
        totalYears.forEach((year) => {
            displayYears.push(year._id.createdAt)
        });

        const orderData = await Orders.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    date: {
                        $gte: new Date(`${salesYear}-01-01`),
                        $lt: new Date(`${salesYear + 1}-01-01`)
                    }
                }
            },
            {
                $group:{
                    _id: { createdAt: { $dateToString: { format: '%m', date: '$createdAt'}}},
                    sales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.date' : 1 }
            }
        ]);

        let months = []
        let sales = []

        function getMonthName(monthNumber) {
            if (monthNumber < 1 || monthNumber > 12) {
                return "Invalid month number";
            }

            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            return monthNames[monthNumber - 1];
        }

        orderData.forEach((month) => {months.push(getMonthName(month._id.date))})
        orderData.forEach((sale) => { sales.push(Math.round(sale.sales))})
        let totalSales = sales.reduce((acc,curr) => acc += curr , 0)

        // category sales
        let categories = []
        let categorySales = []
        const categoryData = await Orders.aggregate([
                    { $match: { status: 'Delivered' } },
                    {
                        $unwind: '$products'
                    },
                    {
                        $lookup: {
                            from: 'products', // Replace 'products' with the actual name of your products collection
                            localField: 'products.productId',
                            foreignField: '_id',
                            as: 'populatedProduct'
                        }
                    },
                    {
                        $unwind: '$populatedProduct'
                    },
                    {
                        $lookup: {
                            from: 'categories', // Replace 'categories' with the actual name of your categories collection
                            localField: 'populatedProduct.category',
                            foreignField: '_id',
                            as: 'populatedCategory'
                        }
                    },
                    {
                        $unwind: '$populatedCategory'
                    },
                    {
                        $group: {
                            _id: '$populatedCategory.name', sales: { $sum: '$totalPrice' } // Assuming 'name' is the field you want from the category collection
                        }
                    }
        ]);

        categoryData.forEach((cat) => {
            categories.push(cat._id),
            categorySales.push(cat.sales)
        })

        let paymentData = await Orders.aggregate([
            { $match: { status: 'Delivered' }},
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }}}
        ]);

        let paymentMethods = []
        let paymentCount = []
        paymentData.forEach((data) => {
            paymentMethods.push(data._id)
            paymentCount.push(data.count)
        })

        let orderDataToDownload = await Orders.find({ status: 'Delivered' }).sort({ createdAt: 1 })
        if(req.query.fromDate && req.query.toDate){
            const { fromDate, toDate } = req.query
            orderDataToDownload = await Orders.find({ status: 'Delivered', createdAt: { $gte: fromDate, $lte: toDate }}).sort({ createdAt: 1 })

        }

        res.render('dashboard',{
                page : 'Dashboard',
                totalUsersCount, 
                usersOntheMonth,
                totalSales,
                totalSalesCount,
                salesOnTheYear,
                totalIncome,
                thisMonthIncome,
                thisYearIncome,
                sales, 
                months, 
                salesYear, 
                displayYears,
                categories,
                categorySales,
                paymentMethods,
                paymentCount,
                orderDataToDownload
        })


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
        user.isBlocked = !user.isBlocked
        await user.save()

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