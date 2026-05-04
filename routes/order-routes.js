const express = require("express");
const router = express.Router();
const {
  orderValidation,
  orderIdValidation,
} = require("../middleware/order-validation");
const {
  createOrder,
  cancelUserOrder,
  findUserOrders,
  findUserOrderDetails,
  createPaymentOrder,
  verifyPayment,
  addItemTobuyNow,
  getBuyNowItem,
  placeOrderViaBuyNow,
  getAllOrders,
} = require("../controller/order-controller");
const authCheck = require("../middleware/auth-check");

router.post("/placeOrder", orderValidation, authCheck, createOrder);
router.get("/getUserOrders", authCheck, findUserOrders);
router.get(
  `/:orderId/details`,
  orderIdValidation,
  authCheck,
  findUserOrderDetails,
);
router.get("/getBuyNowItem", authCheck, getBuyNowItem);
router.get("/allOrders", getAllOrders);
router.patch("/:orderId/cancel", orderIdValidation, authCheck, cancelUserOrder);
router.post("/create-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.post("/addItemToBuyNow", authCheck, addItemTobuyNow);
router.post("/placeOrderViaBuyNow", authCheck, placeOrderViaBuyNow);

module.exports = router;
