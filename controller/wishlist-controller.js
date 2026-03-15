
const { validationResult } = require("express-validator")
const WishList = require("../model/wishlist-model")
const Cart = require("../model/cart-model")
const HttpError = require("../model/http-error")
const User = require("../model/user-model")
const mongoose = require("mongoose")


const addOrRemoveFromWishlist = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg || "Product id required.",
            400
        ))
    }


    const userId = req.userId

    if (!userId) {
        return next(new HttpError("Please provide user id.", 404))
    }

    const { productId } = req.body


    try {
        let message = "Updating wishlist..."
        let wishlistProduct
        let type
        let wishlist = await WishList.findOne({ userId })

        if (!wishlist) {
            wishlist = await WishList.create({ userId, items: [] })
        }

        const existingItem = wishlist.items.find(product =>
            product.product.toString() === productId)

        if (existingItem) {
            type = 'remove'
            message = "Removed from wishlist."
            wishlistProduct = productId
            wishlist.items = wishlist.items.filter(product =>
                product.product.toString() !== productId)
            await wishlist.save()
        } else {
            type = 'add'
            message = "Added to wishlist."
            wishlist.items.push({ product: productId })

            await wishlist.save()
            wishlist = await WishList.findOne({ userId }).populate("items.product")
            wishlistProduct = wishlist.items.find(product =>
                product.product._id.toString() === productId).product.toObject({ getters: true })

        }



        res.status(200).json({
            message,
            wishlistProduct,
            type
        })
    } catch (error) {
        next(error)
    }
}


const getAllWishlistItems = async (req, res, next) => {
    const userId = req.userId


    try {
        const user = await User.findById(userId)

        if (!user) {
            return next(new HttpError("User not found.", 404))
        }


        const wishlist = await WishList.findOne({ userId })
            .populate("items.product");


        res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully.",
            wishlist: wishlist.items.map(wishlist => wishlist.toObject({ getters: true }))
        })
    } catch (error) {
        next(error)
    }
}



const moveToCart = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg || "Product id required.",
            400
        ))
    }

    const userId = req.userId

    if (!userId) {
        return next(new HttpError("Please provide user  id.", 404))
    }
    const { productId } = req.body



    try {
        let wishlist = await WishList.findOne({ userId })

        if (!wishlist) {
            return next(new HttpError("Wishlist not found for that user.", 404))
        }

        const existingWishlistItem = wishlist.items.find(product =>
            product.product.toString() === productId)

        if (!existingWishlistItem) {
            return next(new HttpError("Product not found on wishlist.", 404))
        }

        let cart = await Cart.findOne({ userId })

        if (!cart) {
            cart = await Cart.create({ userId, items: [] })
        }
        const existingItemInCart = cart.items.find(product =>
            product.product.toString() === productId)

        if (existingItemInCart) {
            existingItemInCart.quantity += 1
        } else {
            cart.items.push({ product: productId, quantity: 1 })
        }

        await cart.save()
        wishlist.items = wishlist.items.filter(product => product.product.toString() !== productId)
        await wishlist.save()


        res.status(200).json({
            success: true,
            message: "Product successfully moved to cart.",
            productId
        })
    } catch (error) {
        next(error)
    }
}

const clearWishlist = async (req, res, next) => {

    const userId = req.userId

    try {
        const wishlist = await WishList.findOne({ userId })

        if (!wishlist) {
            return next(new HttpError("Wishlist not found for that user.", 404))
        }

        wishlist.items = []
        await wishlist.save()

        res.status(200).json({
            success: true,
            message: "Wishlist cleared.",

        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    addOrRemoveFromWishlist,
    getAllWishlistItems,
    moveToCart,
    clearWishlist
}