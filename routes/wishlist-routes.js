const express = require("express")

const router = express.Router()
const {
    addOrRemoveFromWishlist,
    getAllWishlistItems,
    moveToCart
} = require("../controller/wishlist-controller")
const { wishlistValidation } = require("../middleware/wishlist-validation")


router.post("/:id", wishlistValidation, addOrRemoveFromWishlist)
router.get("/:id", getAllWishlistItems)
router.patch("/:id", wishlistValidation, moveToCart)

module.exports = router