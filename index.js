require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

const { initializeDb } = require("./db/db-connect")
const productRoute = require("./routes/product-routes")
const addressRoute = require("./routes/address-routes")
const orderRouter = require("./routes/order-routes")
const userRouter = require("./routes/user-routes")
const cartRouter = require("./routes/cart-routes")
const wishlistRouter = require("./routes/wishlist-routes")
const HttpError = require("./model/http-error")


initializeDb()



const corsOptions = {
    origin: ["http://localhost:3000", "https://itshandicrafted-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}
app.use(cors(corsOptions));
app.options("*", cors(corsOptions))

app.use(express.json())

app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api", productRoute)
app.use("/api/address", addressRoute)
app.use("/api/order", orderRouter)


app.use((req, res, next) => {
    const error = new HttpError("Route not found.", 404)
    next(error)
})


app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500).json({ message: error.message || "Something went wrong." })
})



const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})