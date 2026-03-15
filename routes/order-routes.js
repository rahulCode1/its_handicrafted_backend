const express = require("express")
const router = express.Router()
const {
    orderValidation,
    orderIdValidation

} = require("../middleware/order-validation")
const {
    createOrder,
    cancelUserOrder,
    findUserOrders,
    findUserOrderDetails
} = require("../controller/order-controller")
const authCheck = require("../middleware/auth-check")

router.post('/placeOrder', orderValidation, authCheck, createOrder);
router.get('/getUserOrders', authCheck, findUserOrders);
router.get(
    `/:orderId/details`,
    orderIdValidation, authCheck,
    findUserOrderDetails
)
router.patch(
    "/:orderId/cancel",
    orderIdValidation, authCheck,
    cancelUserOrder
)


module.exports = router 