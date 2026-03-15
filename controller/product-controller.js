const { validationResult } = require("express-validator")
const Product = require("../model/product-model")
const HttpError = require("../model/http-error")
const cloudinary = require("../config/cloudinary")

const addNewProduct = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg || "Invalid product data.", 422))
    }

    const { care } = req.body

    if (!req.files || req.files.length === 0) {
        return next(new HttpError("No image uploaded.", 400))

    }

    const uploadedImages = []
    try {


        for (file of req.files) {
            const result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                {
                    folder: "products", // Add folder
                    resource_type: "auto" // Add resource type
                }
            );

            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id
            })
        }


        const careArray = Array.isArray(care)
            ? care
            : care ? [care] : [];



        const product = new Product({
            ...req.body,
            care: careArray,
            images: uploadedImages,
        })

        const saveProduct = await product.save()
        res.status(200).json({
            message: "New product added successfully.",
            product: saveProduct.toObject({ getters: true })
        })
    } catch (error) {

        next(error)
    }
}



const getAllProducts = async (req, res, next) => {

    try {
        const productsList = await Product.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: "All product fetched successfully.",
            products: productsList.map(product => product.toObject({ getters: true }))

        })


    } catch (error) {
        next(error)
    }
}



const productDetails = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg ||
            "Invalid product id to show product details.", 422
        ))
    }
    const productId = req.params.productId


    if (!productId) {
        return next(new HttpError("Please provide product id.", 404))
    }
    try {

        const productDetails = await Product.findById(productId)
        const similarProducts = await Product.find({ category: productDetails.category, _id: { $ne: productDetails._id } }).limit(5)

        if (productDetails) {
            res.status(200).json({
                success: true,
                message: " Product details fetched successfully.",
                product: productDetails.toObject({ getters: true }),
                similarProducts: similarProducts.map(product => product.toObject({ getters: true }))
            })
        } else {
            return next(new HttpError("No product found.", 404))
        }
    } catch (error) {
        next(error)
    }

}

module.exports = { addNewProduct, getAllProducts, productDetails }