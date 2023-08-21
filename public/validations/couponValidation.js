const codeError = document.getElementById('codeErr')
const discountAmountError = document.getElementById("discountAmountErr")
const minPurchaseError = document.getElementById("minPurchaseErr")
const maxDiscountAmountError = document.getElementById('maxDiscountAmountErr')
const expiryDateError = document.getElementById("expiryDateErr")
const descriptionError = document.getElementById("descriptionErr")
const couponCountError = document.getElementById('couponCountErr')


const codeRegex = /^[A-Za-z0-9]{5,15}$/

function validateCode(){
    const code = document.getElementById('code').value.trim()
    if(code.length === 0){
        codeError.innerHTML = 'Code required'
        return false
    }
    if(!code.match(codeRegex)){
        codeError.innerHTML = 'Code must be an alphanumeric value start with an alphabet - 5 to 15 letters'
        return false
    }
    codeError.innerHTML = ''
    return true
}


function validateDiscount(){
    const discount = document.getElementById('discountAmount').value

    if(discount <= 0){
        discountAmountError.innerHTML = 'Discount cannot be a negative number or zero'
        return false
    }else if(discount > 90){
        discountAmountError.innerHTML = 'Upto 90% discount is possible'
        return false
    }
    discountAmountError.innerHTML = ''
    return true
}

function validateMaxDiscount(){
    const maxDiscount = document.getElementById('maxDiscountAmount').value

    if(maxDiscount < 1000 ){
        maxDiscountAmountError.innerHTML = 'Max Discount must be greater than 1000'
        return false
    }
    if(maxDiscount >= 10000 ){
        maxDiscountAmountError.innerHTML = 'Max Discount must be less than 10000'
        return false
    }
    maxDiscountAmountError.innerHTML = ''
    return true
}


function validateMinPurchase(){
    const minPurchase = document.getElementById('minPurchase').value
    if(minPurchase <= 0){
        minPurchaseError.innerHTML = 'Min Purchase amount required'
        return false
    }else if(minPurchase < 500 ){
        minPurchaseError.innerHTML = 'Min Purchase amount must be >500'
        return false
    }else if(minPurchase > 10000 ){
        minPurchaseError.innerHTML = 'Min Purchase amount must be <10000'
        return false
    }

   minPurchaseError.innerHTML = ''
    return true
}


function validateExpiryDate(){
    const expiryDate = document.getElementById('expiryDate').value.trim()
    if(expiryDate.length === 0){
        expiryDateError.innerHTML = 'Expiry Date required'
        return false
    }
    expiryDateError.innerHTML = ''
    return true
}


function validateDescription(){
    const description = document.getElementById('description').value.trim()
    if(description.length === 0){
        descriptionError.innerHTML = 'Description required'
        return false
    }
    descriptionError.innerHTML = ''
    return true
}

function validateCouponCount(){
    const couponCount = document.getElementById('couponCount').value

    if(couponCount < 0 ){
        couponCountError.innerHTML = 'Coupon Count cannot be a negative number'
        return false
    }

    couponCountError.innerHTML = ''
    return true
}

function validateCoupon(){
    return validateCode() && validateDiscount() && validateMaxDiscount() && validateMinPurchase() && validateExpiryDate() && validateDescription() && validateCouponCount()
}
