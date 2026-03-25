const express = require("express")

const router = express.Router()
const upload = require("../config/multer")
const { productValidation, productIdValidation } = require("../middleware/validation")
const {
    addNewProduct,
    getAllProducts,
    productDetails

} = require("../controller/product-controller")
const authCheck = require("../middleware/auth-check")





router.post("/product/add",
    upload.array("images", 10),
  
    authCheck,
    addNewProduct
)

router.get("/products", getAllProducts)
router.get("/product/:productId", productIdValidation, productDetails)




module.exports = router 