const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Cart = require("../model/cart-model");
const Wishlist = require("../model/wishlist-model");
const HttpError = require("../model/http-error");
const Product = require("../model/product-model");
const User = require("../model/user-model");

const addProductToCart = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError(error.array()[0].msg || "Invalid cart data.", 422),
    );
  }

  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError("Please provide user id to add product to cart.", 404),
    );
  }

  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new HttpError("Product not found", 404));
    }

    let cart = await Cart.findOne({ userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product._id.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await Cart.findOne({ userId }).populate("items.product");

    const addedCart = cart.items.find(
      (item) => item.product._id.toString() === productId,
    );

    res.status(200).json({
      success: true,
      message: "Product successfully added to cart.",
      cart: addedCart.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const getAllCartItems = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError(error.array()[0].msg, 422));
  }

  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError("Please provide user id for view user cart.", 404),
    );
  }

  try {
    const carts = await Cart.findOne({ userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    if (!carts) {
      return next(new HttpError("You haven't add any item in cart."), 404);
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      carts: carts.items.map((cart) => cart.toObject({ getters: true })),
    });
  } catch (error) {
    next(error);
  }
};

const increaseQuantity = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError(error.array()[0].msg || "Product id required.", 422),
    );
  }

  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError(
        "Please provide user id for increase product quantity.",
        404,
      ),
    );
  }
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(new HttpError("Cart not found", 404));
    }

    const existingItem = cart.items.find(
      (cart) => cart.product.toString() === productId,
    );

    if (!existingItem) {
      return next(new HttpError("No product found on cart.", 404));
    }
    existingItem.quantity += 1;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity increased successfully.",
      productId: existingItem.product.toString(),
    });
  } catch (error) {
    next(error);
  }
};

const decreaseQuantity = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError(
        error.array()[0].msg || "Product id required to decrease quantity.",
        422,
      ),
    );
  }
  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError(
        "Please provide user id for decrease product quantity.",
        404,
      ),
    );
  }

  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(new HttpError("Cart not found.", 404));
    }
    const existingItem = cart.items.find(
      (product) => product.product.toString() === productId,
    );
    if (!existingItem) {
      return next(new HttpError("Product not found in cart", 404));
    }
    if (existingItem.quantity === 1) {
      cart.items = cart.items.filter(
        (product) => product.product.toString() != productId,
      );
    } else {
      existingItem.quantity -= 1;
    }
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity decrease successfully.",
      productId: existingItem.product.toString(),
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError(
        error.array()[0].msg || "Product id required to remove from cart.",
        422,
      ),
    );
  }

  const userId = req.userId;

  if (!userId) {
    return next(
      new HttpError(
        "Please provide user id for remove product from cart.",
        404,
      ),
    );
  }

  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!cart) {
      return next(new HttpError("Cart not found", 404));
    }
    const existingItem = cart.items.find(
      (product) => product.product.toString() === productId,
    );
    if (!existingItem) {
      return next(new HttpError("Product not found on cart.", 404));
    }
    cart.items = cart.items.filter(
      (product) => product.product.toString() !== productId,
    );
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product successfully removed from cart.",
      productId,
    });
  } catch (error) {
    next(error);
  }
};

const moveToWishlist = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError(
        error.array()[0].msg || "Product id required to move to wishlist.",
        422,
      ),
    );
  }

  const userId = req.userId;
  if (!userId) {
    return next(
      new HttpError(
        "Please provide user id for move product to wishlist.",
        404,
      ),
    );
  }
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(new HttpError("Cart not found for that user.", 404));
    }

    const existingCartItem = cart.items.find(
      (product) => product.product.toString() === productId,
    );

    if (!existingCartItem) {
      return next(new HttpError("Product not found on cart.", 404));
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    const existingWishlistItem = wishlist.items.find(
      (product) => product.product.toString() === productId,
    );

    if (existingWishlistItem) {
      return res
        .status(400)
        .json({ message: "Product already exist on wishlist." });
    }

    wishlist.items.push({ product: productId });

    await wishlist.save();

    cart.items = cart.items.filter(
      (product) => product.product.toString() !== productId,
    );
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product successfully moved to wishlist.",
      productId,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(new HttpError("Cart not found for that user.", 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      userId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProductToCart,
  getAllCartItems,
  increaseQuantity,
  decreaseQuantity,
  moveToWishlist,
  removeFromCart,
  clearCart,
};
