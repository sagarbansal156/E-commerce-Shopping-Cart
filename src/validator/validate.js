let isEmptyObject = function (body) {
    if (!body) return true
    if (Object.keys(body).length == 0) return true;
    return false;
}

let isEmptyVar = function (value) {
    if(!value) return true
    if (typeof value === 'undefined' || value === null) return true;
   // if (value.trim().length === 0) return true;
    return false;
}

let isValidPhone = function (number) {
    let phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
}

let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return emailRegex.test(email)
}

let isValidPassword = function (password) {
    let passwordRegex = /^(?=.[0-9])(?=.[!@#$%^&])[a-zA-Z0-9!@#$%^&]{8,15}$/
    return passwordRegex.test(password)
}

module.exports = { isEmptyObject,
    isEmptyVar,
    isValidEmail,
    isValidPhone,
    isValidPassword}