const express = require("express")
const router = express.Router()
const { otpValidation, resendOtpValidation, sendOtpValidation } = require("../middleware/otp-validation")
const { createUser, getAllUsers, verifyUser, resendOtp, userDetails } = require("../controller/user-controller")
const authCheck = require("../middleware/auth-check")



router.post('/send-otp', sendOtpValidation, createUser);
router.patch('/resend-otp', resendOtpValidation, resendOtp)
router.patch('/verify-otp', otpValidation, verifyUser)
router.get('/', getAllUsers);
router.get("/userDetails", authCheck, userDetails)


module.exports = router