const express = require("express")

const router = express.Router()
const {
    addOrRemoveFromWishlist,
    getAllWishlistItems,
    moveToCart
} = require("../controller/wishlist-controller")
const { wishlistValidation } = require("../middleware/wishlist-validation")
const authCheck = require("../middleware/auth-check")

router.post("/toggle", wishlistValidation,authCheck, addOrRemoveFromWishlist)
router.get("/getAllWishlist",authCheck, getAllWishlistItems)
router.patch("/moveToCart", wishlistValidation,authCheck, moveToCart)


module.exports = router