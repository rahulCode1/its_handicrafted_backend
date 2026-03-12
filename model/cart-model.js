const mongoose = require("mongoose");

const cartModel = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    items: [
        {
            product: {
                type: mongoose.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true, min: 1
            },
          
        }
    ]
},
    {
        timestamps: true
    }
);

const Cart = mongoose.model("Cart", cartModel);
module.exports = Cart;