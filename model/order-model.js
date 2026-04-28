const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    address: {
      type: mongoose.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    summary: {
      totalPrice: { type: Number, required: true },
      totalDiscount: { type: Number, required: true },
      totalQuantity: { type: Number, required: true },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
    },

    orderStatus: {
      type: String,
      enum: ["accepted", "dispatched", "out", "delivered", "cancelled"],
      default: "accepted",
      required: true,
    },
    orderPlacedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
