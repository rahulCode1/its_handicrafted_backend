const { validationResult } = require("express-validator")
const Address = require("../model/user-address-model")
const HttpError = require("../model/http-error")
const User = require("../model/user-model");
const { default: mongoose } = require("mongoose");

// Add New Address
const addNewAddress = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "Invalid inputs credentials, please check your data.",
            422
        ))
    }


    const userId = req.userId

    try {

        let user = await User.findById(userId)

        if (!user) {
            return next(new HttpError("User not found.", 404))
        }


        let isDefault = true

        if (user.address.length > 0) {
            isDefault = false
        }

        const address = new Address({ userId, isDefault, ...req.body });

        const sess = await mongoose.startSession()
        sess.startTransaction()
        await address.save({ session: sess })
        user.address.push(address)
        await user.save({ session: sess })
        await sess.commitTransaction()

        res.status(200).json({
            message: "New address added successfully.",
            address: address.toObject({ getters: true })
        });

    } catch (error) {
        next(error);
    }




};



// Get user Addresses
const getUserAddress = async (req, res, next) => {

    const error = validationResult(req)

    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "User id required.",
            422
        ))
    }


    const userId = req.userId



    if (!userId) {
        return next(new HttpError("Please provide user id to find address.", 404))
    }

    try {
        const userWithAddress = await User.findById(userId).populate("address").sort({ createdAt: -1 })

        if (userWithAddress.address.length === 0) {
            return next(new HttpError("You havn't address, Please add an address.", 404))
        }

        res.status(200).json({
            success: true,
            message: "User address find successfully.",
            address: userWithAddress.address.map(add => add.toObject({ getters: true }))
        })

    } catch (error) {
        next(error)
    }

};

// Delete Address
const deleteAddress = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "Address id required to delete address.",
            422
        ))
    }

    const addressId = req.params.addressId;
    const userId = req.userId

    if (!addressId) {
        return next(new HttpError("Please provide address id.", 404))
    }


    try {
        const findAddress = await Address.findById(addressId).populate("userId")

        if (!findAddress) {
            return next(new HttpError("Address not found with provided id.", 404))
        }

        const createdBy = findAddress.userId._id.toString()

        if (createdBy !== userId) {
            return next(new HttpError("Yourn't allow to delete that address.", 401))
        }

        if (findAddress.isDefault) {
            return next(new HttpError("You can't delete default address.", 422))
        }

        const sess = await mongoose.startSession()
        sess.startTransaction()
        await findAddress.deleteOne({ session: sess })
        findAddress.userId.address.pull(findAddress)
        await findAddress.userId.save({ session: sess })
        await sess.commitTransaction()

        res.status(200).json({
            success: true,
            message: "Address removed successfully.",
            addressId
        })
    } catch (error) {
        next(error);
    }


};


// Update address 
const updateAddress = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "Address id required to update address.",
            422
        ))
    }

    const addressId = req.params.addressId
    const userId = req.userId

    try {
        const address = await Address.findById(addressId)

        if (!address) {
            return next(new HttpError("No address found for update status.", 404))
        }

        const createdBy = address.userId._id.toString()

        if (createdBy !== userId) {
            return next(new HttpError("Yourn't allow to update address.", 401))
        }


        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { userId, ...req.body },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Address update successfully",
            address: updatedAddress.toObject({ getters: true })
        })

    } catch (error) {
        next(error)
    }
}

const updateIsDefault = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "Address id required to set default address.",
            422
        ))
    }

    const addressId = req.params.addressId
    const userId = req.userId

    try {

        const address = await Address.findById(addressId)

        if (!address) {
            return next(new HttpError("No address found for update status.", 404))
        }

        const createdBy = address.userId._id.toString()

        if (createdBy !== userId) {
            return next(new HttpError("Yourn't allow to update address status.", 401))
        }


        await Address.updateMany({}, { isDefault: false })
        const updatedAddressStatus = await Address.findByIdAndUpdate(addressId,
            { isDefault: true },
            { new: true }
        )


        res.status(200).json({
            success: true,
            message: "Address status set default successfully",
            address: updatedAddressStatus.toObject({ getters: true })
        })

    } catch (error) {
        next(error)
    }

}

const findAddressById = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return next(new HttpError(
            error.array()[0].msg ||
            "Address id required to find address details.",
            422
        ))
    }

    const addressId = req.params.addressId

    try {
        const addressInfo = await Address.findById(addressId)

        if (!addressInfo) {
            return next(new HttpError("No address found.", 404))
        }

        res.status(200)
            .json({
                success: true,
                message: "Address info find successfully.",
                address: addressInfo.toObject({ getters: true })
            })

    } catch (error) {
        return next(error)
    }
}


module.exports = {
    addNewAddress,
    getUserAddress,
    deleteAddress,
    updateAddress,
    updateIsDefault,
    findAddressById
};
