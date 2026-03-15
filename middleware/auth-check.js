const jwt = require("jsonwebtoken")
const HttpError = require("../model/http-error")


const authCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return next(new HttpError("Authentication failed, Token required", 401))
        }

        const token = authHeader.split(" ")[1]

        const decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        req.userId = decodeToken.userId

        next()
    } catch (error) {
        return next(new HttpError("Authentication failed, Invalid or expired token", 401))
    }
}

module.exports = authCheck