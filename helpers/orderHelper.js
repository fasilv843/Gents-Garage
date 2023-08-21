const Orders = require('../models/orderModel')


const findIncome = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        console.log(startDate, endDate);

        const ordersData = await Orders.find(
            {
                status: 'Delivered',
                createdAt: {
                    $gte: startDate,
                    $lt: endDate 
                }
            }
        )

        let totalIncome = 0;
        for( const order of ordersData){
            for(const pdt of order.products){
                if(pdt.status === 'Delivered'){
                    totalIncome += parseInt(pdt.totalPrice)
                }
            }
        }
        
        return formatNum(totalIncome)

    } catch (error) {
        throw error
    }
}

const countSales = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        const ordersData = await Orders.find(
            { 
                status: 'Delivered', 
                createdAt:{ 
                    $gte: startDate, 
                    $lt: endDate 
                } 
            }
        )
        
        let salesCount = 0;
        for( const order of ordersData){
            for(const pdt of order.products){
                if(pdt.status === 'Delivered'){
                    salesCount += pdt.quantity;
                }
            }
        }

        return salesCount;

    } catch (error) {
        throw error
    }
}

const findSalesData = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        const pipeline = [
            {
                $match: {
                    status: 'Delivered',
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group:{
                    _id: { createdAt: { $dateToString: { format: '%Y', date: '$createdAt'}}},
                    sales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.createdAt' : 1 }
            }
        ]

        const orderData = await Orders.aggregate(pipeline)
        return orderData

    } catch (error) {
        throw error
    }
}

const findSalesDataOfYear = async(year) => {
    try {
        
        const pipeline = [
            {
                $match: {
                    status: 'Delivered',
                    date: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${year + 1}-01-01`)
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
                $sort: { '_id.createdAt' : 1 }
            }
        ]

        const orderData = await Orders.aggregate(pipeline)
        return orderData

    } catch (error) {
        throw error
    }
}

const findSalesDataOfMonth = async(year, month) => {
    try {

        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);

        const pipeline = [
            {
                $match: {
                    status: 'Delivered',
                    date: {
                        $gte: firstDayOfMonth,
                        $lt: lastDayOfMonth
                    }
                }
            },
            {
                $addFields: {
                    weekNumber: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$createdAt", firstDayOfMonth] },
                                604800000 // milliseconds in a week (7 days)
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { createdAt: "$weekNumber" }, // Group by week number
                    sales: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.createdAt': 1 } }
        ]

        const orderData = await Orders.aggregate(pipeline)
        return orderData

    } catch (error) {
        throw error
    }
}

const  formatNum = (num) => {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(2) + ' L';
    } else if(num >= 1000){
        return (num / 1000).toFixed(2) + ' K '
    } else {
        return num.toString();
    }
}

module.exports = {
    formatNum,
    findIncome,
    countSales,
    findSalesData,
    findSalesDataOfYear,
    findSalesDataOfMonth
}