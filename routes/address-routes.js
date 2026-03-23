const express = require("express")
const router = express.Router()
const {
    addressValidation,
    addressIdValidation

} = require("../middleware/address-validation")
const {
    addNewAddress,
    getAllAddress,
    deleteAddress,
    updateAddress,
    updateIsDefault,
    findAddressById
} = require("../controller/address-controller")
const authCheck = require("../middleware/auth-check")




router.post("/new", addressValidation, authCheck, addNewAddress)
router.get("/getAllAddress", authCheck, getAllAddress)
router.get("/address_info/:addressId", addressIdValidation, authCheck, findAddressById)
router.patch("/update/:addressId/default", authCheck, updateIsDefault)
router.patch("/update/:addressId", addressIdValidation, authCheck, updateAddress)
router.delete("/:addressId", addressIdValidation, authCheck, deleteAddress)


module.exports = router 