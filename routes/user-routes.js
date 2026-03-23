const express = require("express")
const router = express.Router()
const { otpValidation, sendOtpValidation } = require("../middleware/otp-validation")
const { sendOtp, getAllUsers, verifyUser, userDetails } = require("../controller/user-controller")
const authCheck = require("../middleware/auth-check")



router.post('/send-otp', sendOtpValidation, sendOtp);
router.post('/verify-otp', otpValidation, verifyUser)
router.get('/', getAllUsers);
router.get("/userDetails", authCheck, userDetails)


module.exports = router