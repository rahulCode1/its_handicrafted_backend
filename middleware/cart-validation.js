const { check } = require("express-validator")

const cartValidator = [
    check("productId").notEmpty().withMessage("Please provide product id.")
    .isMongoId().withMessage("Product id must be mongoose id."),
    check("quantity").isFloat({ min: 1 }).withMessage("Product quantity minimum should be 1.")
]

const productIdValidator = [
    check("productId").notEmpty().withMessage("Please provide product id.")
    .isMongoId().withMessage("Product id must be mongoose id.")
]


module.exports = {
    cartValidator,
    productIdValidator
}