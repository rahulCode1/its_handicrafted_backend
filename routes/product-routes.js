const express = require("express")

const router = express.Router()
const upload = require("../config/multer")
const { productValidation, productIdValidation } = require("../middleware/validation")
const {
    addNewProduct,
    getAllProducts,
    productDetails
    ,
    deleteProduct
} = require("../controller/product-controller")






router.post("/product/add", upload.array("images", 10), productValidation, addNewProduct)
router.get("/products", getAllProducts)
router.get("/product/:productId", productIdValidation, productDetails)
router.delete("/product/:productId", productIdValidation, deleteProduct)




module.exports = router 