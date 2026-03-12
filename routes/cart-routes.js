const express = require("express")
const router = express.Router()
const { cartValidator, productIdValidator } = require("../middleware/cart-validation")
const {
    addProductToCart,
    getAllCartItems,
    increaseQuantity,
    moveToWishlist,
    decreaseQuantity,
    removeFromCart
} = require("../controller/cart-controller")


router.post("/:userId", cartValidator, addProductToCart)
router.get("/:userId", getAllCartItems)
router.patch("/:userId", productIdValidator, increaseQuantity)
router.patch("/decrease/:userId", productIdValidator, decreaseQuantity)
router.patch("/remove/:userId", productIdValidator, removeFromCart)
router.patch("/moveto_wishlist/:userId", productIdValidator, moveToWishlist)

module.exports = router