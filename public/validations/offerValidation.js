
const nameErr = document.getElementById('nameErr')
const discountErr = document.getElementById('discountErr')
const startingDateErr = document.getElementById('startingDateErr')
const expiryDateErr = document.getElementById('expiryDateErr')

function validateName(){
    const name = document.getElementById('name').value.trim()
    if(name.length === 0){
        nameErr.innerHTML = 'Name required'
        return false
    }

    return true;
}

function validateDiscound(){
    const discount = document.getElementById('discount').value.trim()
    if(discount.length === 0){
        discountErr.innerHTML = 'Discount required'
        return false
    }
    if(discount < 1 || discount > 90 ){
        discountErr.innerHTML = 'Discount must be >= 1 or <= 90'
        return false
    }
    return true
}

function validateStartingDate(){
    const startingDate = document.getElementById('startingDate').value
    if(!startingDate){
        startingDateErr.innerHTML = 'Starting Date required'
        return false
    }
    return true
}

function validateExpiryDate(){
    const expiryDate = document.getElementById('expiryDate').value
    if(!expiryDate){
        expiryDateErr.innerHTML = 'Expiry Date required'
        return false
    }
    if(new Date(expiryDate) <= new Date()){
        expiryDateErr.innerHTML = 'Add a date in future';
        return false
    }
    return true
}

function validateOffer(){
    return validateName() && validateDiscound() && validateStartingDate() && validateExpiryDate()
}