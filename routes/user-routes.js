const express = require("express")
const router = express.Router()
const { otpValidation, resendOtpValidation, sendOtpValidation } = require("../middleware/otp-validation")
const { createUser, getAllUsers, verifyUser, resendOtp } = require("../controller/user-controller")




router.post('/send-otp', sendOtpValidation, createUser);
router.patch('/resend-otp', resendOtpValidation, resendOtp)
router.patch('/verify-otp', otpValidation, verifyUser)
router.get('/', getAllUsers);

module.exports = router