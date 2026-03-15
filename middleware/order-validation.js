const { check , param} = require("express-validator")

const orderValidation = [

    // Address & User
    check("address").trim().notEmpty().withMessage("Address id required.")
        .isMongoId()
        .withMessage("Invalid address id."),

   // Summary
    check("summary.totalPrice")
        .isFloat({ min: 0.01 })
        .withMessage("Total price must be at least 0.01."),

    check("summary.totalDiscount")
        .isFloat({ min: 0 })
        .withMessage("Total discount must be non-negative."),

    check("summary.totalQuantity")
        .isInt({ min: 1 })
        .withMessage("Total quantity must be at least 1."),

    // Payment
    check("paymentMethod")
        .isIn(['COD',  'UPI'])
        .withMessage("Invalid payment method."),

    check("paymentStatus")
        .isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage("Invalid payment status."),



 ];

const orderIdValidation = [
    param("orderId").trim().notEmpty().withMessage("Order id required.")
    .isMongoId().withMessage("Order id must be mongoose id.")
]

module.exports = {
    orderValidation,
    orderIdValidation
}