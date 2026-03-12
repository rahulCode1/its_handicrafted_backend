const { check } = require("express-validator")

const wishlistValidation = [
    check("productId").trim().notEmpty()
    .withMessage("Please provide product id to add to wishlist.")
    .isMongoId().withMessage("Product id must be mongoose id.")
]


module.exports = {
    wishlistValidation
}