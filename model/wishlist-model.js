const mongoose = require("mongoose")


const wishListSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    items: [
        {
            product: { type: mongoose.Types.ObjectId, ref: "Product", required: true }
        }
    ]
}, { timestamps: true })

const WishList = mongoose.model("Wishlist", wishListSchema)
module.exports = WishList