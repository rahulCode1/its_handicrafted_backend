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


router.post('/:id', orderValidation, createOrder);
router.get('/:id', findUserOrders);
router.get(
    `/:orderId/details`,
    orderIdValidation,
    findUserOrderDetails
)
router.patch(
    "/:id/cancel",
    orderIdValidation,
    cancelUserOrder
)


module.exports = router 