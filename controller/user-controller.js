const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const { validationResult } = require("express-validator")
const User = require('../model/user-model');
const HttpError = require("../model/http-error")


// Create user
const createUser = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg || "Invalid user credentials",
            400
        ))
    }

    const { name, phoneNumber } = req.body;

    try {


        let user = await User.findOne({ phoneNumber })

        const otp = otpGenerator.generate(4, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const expiresAt = Date.now() + 1 * 60 * 1000

        if (!user) {

            user = new User({
                name,
                phoneNumber,
                address: [],
                orders: []
            });

        }

        user.otp = otp
        user.expiresAt = expiresAt
        user.resentOtpTime = Date.now() + 0.1 * 60 * 1000
        await user.save();


        res.status(200).json({
            message: "Otp sent successfully.",
            otp,
            user
        });
    } catch (error) {
        next(error);
    }
};


// Resend otp 
const resendOtp = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(
            errors.array()[0].msg ||
            "Invalid phone number",
            400
        ))
    }

    const { phoneNumber } = req.body

    try {
        let user = await User.findOne({ phoneNumber })

        if (!user) {
            return next(new HttpError(
                errors.array()[0].msg ||
                "User not found.",
                404
            ))

        }


        if (user.resentOtpTime > Date.now()) {
            return next(new HttpError("Please wait before requesting new OTP", 429));
        }

        const otp = otpGenerator.generate(4, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const expiresAt = Date.now() + 1 * 60 * 1000

        user.otp = otp
        user.expiresAt = expiresAt
        user.resentOtpTime = Date.now() + 0.1 * 60 * 1000

        await user.save();


        res.status(200).json({
            message: "Otp re-sent successfully.",
            otp
        });
    } catch (error) {
        next(error)
    }
}


// Verify user otp 
const verifyUser = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg || "Invalid user credentials", 400))
    }


    const { otp, phoneNumber } = req.body

    try {

        let user = await User.findOne({ phoneNumber })


        if (!user) {
            return next(new HttpError("User not exist, Please sign up", 404))
        }

        if (!user.otp) {
            return next(new HttpError("No active OTP, please request new OTP", 400));
        }

        if (Date.now() > user.expiresAt) {
            return next(new HttpError("Otp expired, Please resend otp", 403))
        }

        if (user.otp !== Number(otp)) {
            return next(new HttpError(`Invalid otp, Please enter correct otp`, 400))
        }


        user.otp = null
        user.expiresAt = null
        await user.save()

        const token = jwt.sign(
            { userId: user._id, phoneNumber },
            process.env.SECRET_KEY,
            { expiresIn: '30d' }
        )

        const transformUser = {
            userId: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber
        }
        res.status(200).json({
            success: true,
            token,
            user: transformUser,

        })

    } catch (error) {
        next(error)
    }
}


// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const userList = await User.find();

        if (userList.length !== 0) {
            res.status(200).json({
                success: true,
                message: "All users fetched successfully.",
                data: { users: userList.map(user => user.toObject({ getters: true })) },
            });
        } else {
            return next(new HttpError("No product found.", 404))
        }
    } catch (error) {
        next(error);
    }
};

// User details
const userDetails = async (req, res, next) => {
    try {
        const userId = req.userId

        if (!userId) {
            return next(new HttpError("User id not found.", 404))
        }
        
        const user = await User.findById(userId)

        // console.log(user)

        if (!user) {
            return next(new HttpError("User not found.", 404))
        }


        res.status(201).json({
            success: true,
            message: "User fetch successfully.",
            user: user.toObject({ getters: true })
        })

    } catch (error) {
        next(error)
    }
}


module.exports = {
    createUser,
    getAllUsers,
    verifyUser,
    resendOtp,
    userDetails
};