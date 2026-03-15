const { validationResult } = require("express-validator")
const Order = require('../model/order-model')
const HttpError = require("../model/http-error")
const Cart = require("../model/cart-model")
const User = require("../model/user-model")



const createOrder = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg ||
            "Invalid order data",
            422
        ))
    }

    const userId = req.userId

    if (!userId) {
        return next(new HttpError("Please provide user id for place order.", 404))
    }

    const orderData = req.body;
   

    const cart = await Cart.findOne({ userId })

    if (!cart) {
        return next(new HttpError("User doesn't have cart.", 404))
    }

    if (cart.items.length === 0) {
        return next(new HttpError("Cart is empty, Please add products to cart.", 500))
    }

    try {

        let products = []


        cart.items.forEach(cart =>
            products.push({
                product: cart.product.toString(),
                quantity: cart.quantity
            }))

        const order = new Order({ products, ...orderData, orderPlacedBy: userId });
        await order.save();



        cart.items = []
        await cart.save()
        products = []

        res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            order: order.toObject({ getters: true })
        });

    } catch (error) {
        next(error);
    }
};


const findUserOrders = async (req, res, next) => {

    const userId = req.userId

    if (!userId) {
        return next(new HttpError("Please provide user id for find user order.", 404))
    }

    try {
        const orders = await Order.find({
            orderPlacedBy: userId
        }).populate("products.product").sort({ createdAt: -1 }).lean()


        const transformedOrder = orders.map(order => ({
            ...order,
            id: order._id,
            products: order.products.map(product => ({
                ...product.product,
                quantity: product.quantity,
                id: product._id
            }))

        }))


        res.status(200).json({
            message: "Orders find successfully.",
            orders: transformedOrder
        })

    } catch (error) {
        next(error)
    }
}

const findUserOrderDetails = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg ||
            "Invalid order id to find order details",
            422
        ))
    }

    const userId = req.userId
    const orderId = req.params.orderId

    if (!userId) {
        return next(new HttpError("Please provide user id for find user order.", 404))
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return next(new HttpError("User not found with that id.", 404))
        }


        const order = await Order.findById(orderId)
            .populate("products.product").populate("address").populate("orderPlacedBy")


        res.status(200).json({
            message: "Orders find successfully.",
            order: order.toObject({ getters: true })
        })

    } catch (error) {
        next(error)
    }
}

const cancelUserOrder = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg ||
            "Invalid order id to cancel order",
            422
        ))
    }

    const orderId = req.params.orderId;

    if (!orderId) {
        return next(new HttpError("Please provide order id for cancel order.", 404))
    }

    const userId = req.userId

    if (!userId) {
        return next(new HttpError("Please provide user id for find user order.", 404))
    }

    try {

        const user = await User.findById(userId)

        if (!user) {
            return next(new HttpError("User not found with that id.", 404))
        }


        const order = await Order.findById(orderId);

        if (!order) {
            return next(new HttpError(`Order doesn't exist with that id.`, 404))
        }

        if (userId !== order.orderPlacedBy.toString()) {
            return next(new HttpError("Only owner can cancel their order.", 401))
        }

        order.orderStatus = 'cancelled'
        await order.save()

        res.status(200).json({
            success: true,
            message: "Order canceled successfully.",
            orderId
        });

    } catch (error) {
        next(error);
    }
};




module.exports = {
    createOrder,
    cancelUserOrder,
    findUserOrders,
    findUserOrderDetails

};