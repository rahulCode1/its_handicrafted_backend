const express = require("express")
const router = express.Router()
const { cartValidator, productIdValidator } = require("../middleware/cart-validation")
const {
    addProductToCart,
    getAllCartItems,
    increaseQuantity,
    moveToWishlist,
    decreaseQuantity,
    removeFromCart,
    clearCart
} = require("../controller/cart-controller")
const authCheck = require("../middleware/auth-check")


router.post("/addToCart", cartValidator, authCheck, addProductToCart)
router.get("/getAllCart", authCheck, getAllCartItems)
router.patch("/increase", productIdValidator, authCheck, increaseQuantity)
router.patch("/decrease", productIdValidator, authCheck, decreaseQuantity)
router.patch("/remove", productIdValidator, authCheck, removeFromCart)
router.patch("/moveto_wishlist", productIdValidator, authCheck, moveToWishlist)
router.patch("/clearCart", authCheck, clearCart)

module.exports = router