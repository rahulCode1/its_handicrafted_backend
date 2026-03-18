const express = require("express")
const router = express.Router()
const { createOrder, paymentVarification, razorpayKey } = require("../controller/razorpay-controller")

router.get("/getKey", razorpayKey)
router.post("/create-order", createOrder)
router.post("/paymentVarification", paymentVarification)


module.exports = router 