const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const client = require("../config/twilio.config");
const User = require("../model/user-model");
const HttpError = require("../model/http-error");

// Create user
const sendOtp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(errors.array()[0].msg || "Invalid user credentials", 400),
    );
  }

  const { phoneNumber } = req.body;

  try {
    // await client.verify.v2
    //   .services(process.env.TWILIO_SERVICE_SID)
    //   .verifications.create({
    //     to: `+91${phoneNumber}`,
    //     channel: "sms",
    //   });

   

    res.status(200).json({
      message: "Otp sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Verify user otp
const verifyUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(errors.array()[0].msg || "Invalid user credentials", 400),
    );
  }

  const { name, otp, phoneNumber } = req.body;

 

  try {
    // const verificationCheck = await client.verify.v2
    //   .services(process.env.TWILIO_SERVICE_SID)
    //   .verificationChecks.create({
    //     to: `+91${phoneNumber}`,
    //     code: otp,
    //   });

    // if (verificationCheck.status !== "approved") {
    //   return next(new HttpError("Invalid otp", 400));
    // }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({
        name,
        phoneNumber,
        address: [],
        orders: [],
        resentOtpTime: Date.now() + 0.3 * 60 * 1000,
      });
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, phoneNumber },
      process.env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    const transformUser = {
      userId: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    };

    res.status(200).json({
      success: true,
      token,
      user: transformUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const userList = await User.find();

    if (userList.length !== 0) {
      res.status(200).json({
        success: true,
        message: "All users fetched successfully.",
        data: {
          users: userList.map((user) => user.toObject({ getters: true })),
        },
      });
    } else {
      return next(new HttpError("No product found.", 404));
    }
  } catch (error) {
    next(error);
  }
};

// User details
const userDetails = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return next(new HttpError("User id not found.", 404));
    }

    const user = await User.findById(userId);

    // console.log(user)

    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    res.status(201).json({
      success: true,
      message: "User fetch successfully.",
      user: user.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  getAllUsers,
  verifyUser,
  userDetails,
};
