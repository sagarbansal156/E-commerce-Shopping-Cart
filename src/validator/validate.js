const mongoose = require('mongoose');
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
let isREgexName = function (attribute) {
    return (/^[a-zA-Z]{2,20}$/.test(attribute.trim()))
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
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/

    return passwordRegex.test(password)
}

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId);   // to validate a MongoDB ObjectId we are use .isValid() method on ObjectId
};

module.exports = { isEmptyObject,
    isEmptyVar,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isREgexName
}