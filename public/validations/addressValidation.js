
const nameError = document.getElementById('nameErr')
const mobileError = document.getElementById("mobileErr")
const emailError = document.getElementById("emailErr")
const townError = document.getElementById("townErr")

const stateError = document.getElementById("stateErr")
const countryError = document.getElementById("countryErr")
const pincodeError = document.getElementById("zipErr")
const addressError = document.getElementById("addressErr")

const nameRegex = /^[a-zA-Z]+([',. -][a-zA-Z, ]*[a-zA-Z])?$/
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
const pincodeRegex = /^[1-9][0-9]{5}$/


function validateName() {
    let name = document.getElementById("name").value.trim()

    if (name.length === 0) {
        nameError.innerHTML = "Name required!";
        return false;
    }

    if (!name.match(nameRegex)) {
        nameError.innerHTML = "Numbers not allowed";
        return false;
    }

    nameError.innerHTML = "";
    return true;
}


function validateEmail() {
    let email = document.getElementById("email").value.trim()
    if (email.length === 0) {
        emailError.innerHTML = "Email required!";
        return false;
    }
    if (!email.match(emailRegex)) {
        emailError.innerHTML = "Enter a valid email";

        return false;
    }
    emailError.innerHTML = "";
    return true;
}

function validateMobile() {
    let mobile = document.getElementById('mobile').value.trim()

    if (mobile.length === 0) {
        mobileError.innerHTML = "Mobile required!";
        return false;
    }
    if (!mobile.match(mobileRegex)) {
        mobileError.innerHTML = 'Enter a valid mobile no.'
        return false
    }
    mobileError.innerHTML = ""
    return true
}


function validatePincode() {
    let pincode = document.getElementById('zip').value.trim()

    if (pincode.length === 0) {
        pincodeError.innerHTML = "Pincode required!";
        return false;
    }
    if (!pincode.match(pincodeRegex)) {
        pincodeError.innerHTML = 'Enter a valid pincode no.'
        return false
    }
    pincodeError.innerHTML = ""
    return true
}

function validateTown() {
    let town = document.getElementById("town").value.trim()

    if (town.length === 0) {
        townError.innerHTML = "Town required!";
        return false;
    }
    if (!town.match(nameRegex)) {
        townError.innerHTML = "No numbers allowed";
        return false;
    }
    townError.innerHTML = "";
    return true;
}

function validateState() {
    let state = document.getElementById("state").value.trim()

    if (state.length === 0) {
        stateError.innerHTML = "State required!";
        return false;
    }
    if (!state.match(nameRegex)) {
        stateError.innerHTML = "No numbers allowed";
        return false;
    }
    stateError.innerHTML = "";
    return true;
}

function validateCountry() {
    let country = document.getElementById("country").value.trim()

    if (country.length === 0) {
        countryError.innerHTML = "country required!";
        return false;
    }
    if (!country.match(nameRegex)) {
        countryError.innerHTML = "No numbers allowed";
        return false;
    }
    countryError.innerHTML = "";
    return true;
}

function validateAddress() {
    let address = document.getElementById("address").value.trim()

    if (address.length === 0) {
        addressError.innerHTML = "address required!";
        return false;
    }

    addressError.innerHTML = "";
    return true;
}


function validateNewAddress(){
    return (
        validateName() &&
        validateMobile() &&
        validateEmail() &&
        validateTown() &&
        validateState() &&
        validateCountry() &&
        validatePincode() &&
        validateAddress()
    )
}
