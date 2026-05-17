const { validationResult } = require("express-validator");
const Product = require("../model/product-model");
const HttpError = require("../model/http-error");
const cloudinary = require("../config/cloudinary");
const User = require("../model/user-model");
const Review = require("../model/product-review-model");
const Order = require("../model/order-model");

const addNewProduct = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return next(
  //     new HttpError(errors.array()[0].msg || "Invalid product data.", 422),
  //   );
  // }

  const { care } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new HttpError("No image uploaded.", 400));
  }

  const uploadedImages = [];
  try {
    for (file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "products", // Add folder
          resource_type: "auto", // Add resource type
        },
      );

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const careArray = Array.isArray(care) ? care : care ? [care] : [];

    const product = new Product({
      ...req.body,
      care: careArray,
      images: uploadedImages,
      createdBy: req.userId,
    });

    const saveProduct = await product.save();
    res.status(200).json({
      message: "New product added successfully.",
      product: saveProduct.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const productsList = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All product fetched successfully.",
      products: productsList.map((product) =>
        product.toObject({ getters: true }),
      ),
    });
  } catch (error) {
    next(error);
  }
};

const productDetails = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.array()[0].msg || "Invalid product id to show product details.",
        422,
      ),
    );
  }
  const productId = req.params.productId;

  if (!productId) {
    return next(new HttpError("Please provide product id.", 404));
  }
  try {
    const productDetails = await Product.findById(productId);
    res.status(200).json({
      success: true,
      message: " Product details fetched successfully.",
      product: productDetails.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const similarProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.array()[0].msg || "Invalid product id to show product details.",
        422,
      ),
    );
  }
  const productId = req.params.productId;

  if (!productId) {
    return next(new HttpError("Please provide product id.", 404));
  }
  try {
    const productDetails = await Product.findById(productId);
    const similarProducts = await Product.find({
      category: productDetails.category,
      _id: { $ne: productDetails._id },
    }).limit(10);

    res.status(200).json({
      success: true,
      message: "Similar products fetched successfully.",

      similarProducts: similarProducts.map((product) =>
        product.toObject({ getters: true }),
      ),
    });
  } catch (error) {
    next(error);
  }
};

const updateProducts = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const userId = req.userId;
    let product = await Product.findById(productId);

    if (!product) {
      return next(new HttpError("Product not found.", 404));
    }

    if (product.createdBy.toString() !== userId) {
      return next(new HttpError("Only owner can update product.", 403));
    }

    await Product.findByIdAndUpdate({ _id: productId }, req.body, {
      new: true,
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: product.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const addUserReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, reviewText } = req.body;

    const userId = req.userId;
    const user = await User.findById(userId);

    if (!req.files || req.files.length === 0) {
      return next(new HttpError("Images not found.", 404));
    }

    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    // Check purchase
    const userOrders = await Order.find({ orderPlacedBy: userId }).populate(
      "products.product",
    );

    const isOrderExist = userOrders.some((order) =>
      order.products.some(
        (product) => product.product._id.toString() === productId,
      ),
    );

    if (!isOrderExist) {
      return next(new HttpError("User did not buy this product yet.", 404));
    }

    const findReviewedProduct = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (findReviewedProduct) {
      return next(new HttpError("Product reviewed already.", 403));
    }

    const uploadedImages = [];

    for (file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "product",
          resource_type: "auto",
        },
      );
      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const review = new Review({
      product: productId,
      rating,
      reviewText,
      user: userId,
      images: uploadedImages,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const getAllProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const productReviews = await Review.find({ product: productId }).populate(
      "user",
    );

    res.status(200).json({
      success: true,
      message: "Product reviews fetched successfully.",
      reviews: productReviews.map((review) =>
        review.toObject({ getters: true }),
      ),
    });
  } catch (err) {
    next(error);
  }
};
module.exports = {
  addNewProduct,
  getAllProducts,
  productDetails,
  updateProducts,
  similarProduct,
  addUserReview,
  getAllProductReviews,
};
