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
    countSales
}