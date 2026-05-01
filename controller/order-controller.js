const { validationResult } = require("express-validator");
const crypto = require("crypto");
const Order = require("../model/order-model");
const HttpError = require("../model/http-error");
const Cart = require("../model/cart-model");
const User = require("../model/user-model");
const razorpay = require("../config/razorpay.js");
const Product = require("../model/product-model.js");
const BuyNow = require("../model/buy-now-model.js");

const createOrder = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(errors.array()[0].msg || "Invalid order data", 422),
    );
  }

  const userId = req.userId;

  const { summary, address, paymentMethod } = req.body;

  if (!userId) {
    return next(new HttpError("Please provide user id for place order.", 404));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new HttpError("User doesn't have cart.", 404));
  }

  if (cart.items.length === 0) {
    return next(
      new HttpError("Cart is empty, Please add products to cart.", 500),
    );
  }

  try {
    let products = [];
    let order;

    cart.items.forEach((item) =>
      products.push({
        product: item.product.toString(),
        quantity: item.quantity,
      }),
    );

    if (paymentMethod === "ONLINE") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new HttpError("Payment details missing", 400));
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return next(new HttpError("Payment verification failed", 400));
      }

      order = new Order({
        products,
        orderPlacedBy: userId,
        address,
        paymentInfo: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        paymentMethod,
        paymentStatus: "completed",
        summary,
      });
    } else {
      order = new Order({
        products,
        address,
        paymentMethod,
        summary,
        paymentStatus: "pending",
        orderPlacedBy: userId,
      });
    }

    await order.save();

    cart.items = [];
    await cart.save();
    products = [];

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: order.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const findUserOrders = async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError("Please provide user id for find user order.", 404),
    );
  }

  try {
    const orders = await Order.find({
      orderPlacedBy: userId,
    })
      .populate("products.product")
      .sort({ createdAt: -1 })
      .lean();

    const transformedOrder = orders.map((order) => ({
      ...order,
      id: order._id,
      products: order.products.map((product) => ({
        ...product.product,
        quantity: product.quantity,
        id: product._id,
      })),
    }));

    res.status(200).json({
      message: "Orders find successfully.",
      orders: transformedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const findUserOrderDetails = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.array()[0].msg || "Invalid order id to find order details",
        422,
      ),
    );
  }

  const userId = req.userId;
  const orderId = req.params.orderId;

  if (!userId) {
    return next(
      new HttpError("Please provide user id for find user order.", 404),
    );
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("User not found with that id.", 404));
    }

    const order = await Order.findById(orderId)
      .populate("products.product")
      .populate("address")
      .populate("orderPlacedBy");

    res.status(200).json({
      message: "Orders find successfully.",
      order: order.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const cancelUserOrder = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.array()[0].msg || "Invalid order id to cancel order",
        422,
      ),
    );
  }

  const orderId = req.params.orderId;

  if (!orderId) {
    return next(
      new HttpError("Please provide order id for cancel order.", 404),
    );
  }

  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError("Please provide user id for find user order.", 404),
    );
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("User not found with that id.", 404));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new HttpError(`Order doesn't exist with that id.`, 404));
    }

    if (userId !== order.orderPlacedBy.toString()) {
      return next(new HttpError("Only owner can cancel their order.", 401));
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order canceled successfully.",
      orderId,
    });
  } catch (error) {
    next(error);
  }
};

const createPaymentOrder = async (req, res, next) => {
  const options = {
    amount: req.body.amount * 100,
    currency: "INR",
    receipt: "receipt_order_1",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(
        new HttpError("Failed to make payment, Please try again later.", 500),
      );
    }

    res.status(200).json({
      success: true,
      message: "Payent completed successfully.",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  } catch (error) {
    next(error);
  }
};

const addItemTobuyNow = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(errors.array()[0].msg || "Invalid product data", 422),
    );
  }

  try {
    const user = req.userId;

    const existingItem = await BuyNow.findOne({ user });

    if (existingItem) {
      await existingItem.deleteOne();
    }

    const buyingItem = new BuyNow({ ...req.body, user });
    await buyingItem.save();

    res.status(201).json({
      success: true,
      message: "Product added to order",
      order: buyingItem.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const getBuyNowItem = async (req, res, next) => {
  try {
    const user = req.userId;
    const buyNowItem = await BuyNow.findOne({ user }).populate("product");

    if (!buyNowItem) {
      return next(new HttpError("Item not found", 404));
    }


   

    res.status(200).json({
      success: true,
      message: "Buy now item find successfully.",
      item: buyNowItem.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const placeOrderViaBuyNow = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new HttpError(errors.array()[0].msg || "Invalid order data", 422),
      );
    }

    const user = req.userId;
    const { address, summary, paymentMethod } = req.body;

    if (!user) {
      return next(
        new HttpError("Please provide user id for place order.", 404),
      );
    }

    let item = await BuyNow.findOne({ user });

    

    if (!item) {
      return next(new HttpError("Item not found to place order.", 404));
    }

    const product = await Product.findById(item.product);

    let order;

    if (paymentMethod === "ONLINE") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return next(
          new HttpError("Failed to make payment, Please try againlater.", 500),
        );
      }

      order = new Order({
        products: [
          {
            product: item.product,
            quantity: item.quantity,
          },
        ],
        orderPlacedBy: user,
        paymentInfo: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        address,
        paymentMethod,
        paymentStatus: "completed",
        summary,
      });
    } else {
      order = new Order({
        orderPlacedBy: user,
        ...req.body,
        products: [
          {
            product: item.product,
            quantity: item.quantity,
          },
        ],
        summary,
      });
    }

    await order.save();

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order placed successfully.",
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  cancelUserOrder,
  findUserOrders,
  findUserOrderDetails,
  createPaymentOrder,
  verifyPayment,
  addItemTobuyNow,
  getBuyNowItem,
  placeOrderViaBuyNow,
};
