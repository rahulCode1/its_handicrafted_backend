// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,

    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        min: 10,
        max: 10,
        unique: true,
        trim: true,

    },


    resentOtpTime: {
        type: Date,
    },
  


    orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }],
    address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema)
module.exports = User 