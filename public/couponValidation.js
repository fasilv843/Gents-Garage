const codeError = document.getElementById('codeErr')
const discountError = document.getElementById("discountErr")
const minPurchaseError = document.getElementById("minPurchaseErr")
const expiryDateError = document.getElementById("expiryDateErr")
const descriptionError = document.getElementById("descriptionErr")

const codeRegex = /^[A-Z0-9]{5,15}$/

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
    const discount = document.getElementById('discount').value
    // if(discount === 0){
    //     discountError.innerHTML = 'Discount percentage required'
    //     return false
    // }

    if(discount <= 0){
        discountError.innerHTML = 'Discount cannot be a negative number or zero'
        return false
    }else if(discount > 90){
        discountError.innerHTML = 'Upto 90% discount is possible'
        return false
    }
    discountError.innerHTML = ''
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

function validateCoupon(){
    return validateCode() && validateDiscount() && validateMinPurchase() && validateExpiryDate() && validateDescription()
}

// function validateCoupon(){
//     return false
// }
