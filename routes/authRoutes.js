const express = require('express')
const router = express.Router()

const {signupUser,
    setFcmToken,
    deleteFcmToken,
    loginUser,
    verifyOTP,
    resendOTP,
    resetPasswordRequest,
    verifyPasswordOtp,
    newPassword,
    resendPasswordOTP} = require("../controllers/authController")

router.post("/login",loginUser)

router.post("/signup",signupUser)

router.patch("/setFcmToken",setFcmToken)
router.patch("/deleteFcmToken",deleteFcmToken)

router.patch("/verifyOTP",verifyOTP)
router.patch("/resendOTP",resendOTP)
router.patch("/resetPasswordRequest",resetPasswordRequest)
router.patch("/verifyPasswordOtp",verifyPasswordOtp)
router.patch("/newPassword",newPassword)
router.patch("/resendPasswordOTP",resendPasswordOTP)

module.exports = router