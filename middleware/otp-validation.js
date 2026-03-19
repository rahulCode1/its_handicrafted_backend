const { check } = require("express-validator")

const sendOtpValidation = [

    check("phoneNumber")
        .trim()
        .notEmpty().withMessage("Please provide phone number.")
        .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits.")
        .isNumeric().withMessage("Phone number must contain only digits.")
]


const otpValidation = [
    check("name")
        .trim()
        .notEmpty().withMessage("Please provide user name.")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),
    ,
    check("otp").trim().notEmpty().withMessage("Otp required")
        .isNumeric().withMessage("Must be number")
        .isLength({ min: 4, max: 4 }).withMessage("Otp must be 4 digits"),
    check("phoneNumber").trim().notEmpty().withMessage("phone number required")
        .isNumeric().withMessage("Must be number")
        .isLength({ min: 10, max: 10 }).withMessage("phone number must be 10 digits")
]




module.exports = {
    sendOtpValidation,
    otpValidation,
}