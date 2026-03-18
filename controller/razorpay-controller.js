const razorpay = require("../config/razorpay.config")
const crypto = require("crypto")
const Payment = require("../model/payment-model")
const HttpError = require("../model/http-error")

const createOrder = async (req, res, next) => {

    const { amount } = req.body

    try {

        const options = {
            amount: amount * 100,
            currency: "INR",
        }
        const order = await razorpay.orders.create(options)

        res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        next(error)
    }
}


const razorpayKey = async (req, res, next) => {
    const key = process.env.RAZORPAY_KEY_ID

    res.json({ key })
}

const paymentVarification = async (req, res, next) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    


    if (isAuthentic) {
        await Payment.create({ razorpay_order_id, razorpay_payment_id, razorpay_signature })

        res.redirect(`http://localhost:3000/paymentSuccess?reference=${razorpay_payment_id}`)
    }else{
        return next(new HttpError())
    }


   
}


module.exports = {
    createOrder,
    paymentVarification,
    razorpayKey
}