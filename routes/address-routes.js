const express = require("express")
const router = express.Router()
const {
    addressValidation,
    addressIdValidation

} = require("../middleware/address-validation")
const {
    addNewAddress,
    getUserAddress,
    deleteAddress,
    updateAddress,
    updateIsDefault,
    findAddressById
} = require("../controller/address-controller")





router.post("/new", addressValidation, addNewAddress)
router.get("/:userId", getUserAddress)
router.get("/address_info/:addressId",addressIdValidation, findAddressById)
router.patch("/update/:addressId/default",addressIdValidation, updateIsDefault)
router.patch("/update/:addressId", addressIdValidation,  updateAddress)
router.delete("/:addressId", addressIdValidation, deleteAddress)


module.exports = router 