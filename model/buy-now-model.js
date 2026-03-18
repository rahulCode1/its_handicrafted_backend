const mongoose = require("mongoose")

const buyNowSchema = new mongoose.Schema({
    quantity: { type: Number, min: 1 },
    product: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
})

const BuyNow = mongoose.model("BuyNow", buyNowSchema)
module.exports = BuyNow 