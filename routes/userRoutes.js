const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


// const {getUserById , getUserProfile,getAllFollowersAndFollowing, followUser, blockUser, searchUsers, getAllFollowers, getAllFollowing, getBlocked, setProfilePic, getProfilePic, deleteProfilePic,changePassword,editProfile,getAllUsers,resetPasswordRequest,verifyPasswordOtp ,newPassword,setVerified,getVideos,getUserReels ,getImages, deleteUser, deleteUserByUsername, generateShareableProfileLink} 
const {
    getProfilePic,
    setProfilePic,
    getUserById,
    deleteUser,
    deleteUserByUsername,
    generateShareableProfileLink,
    resetPasswordRequest,
    verifyPasswordOtp,
    newPassword,
    searchUsers,
    changePassword,
    getAllUsers,
    setUserInfo,
    setUserBank,
    setUserBusiness,
    setAutomaticOptions,
    createCustomer,
    getUserProfile,
    switchRole
} = require("../controllers/userController")

router.patch("/resetPasswordRequest",resetPasswordRequest)
router.patch("/verifyPasswordOtp",verifyPasswordOtp)
router.patch("/newPassword",newPassword)

const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

router.get("/getUserById/:userid",getUserById)
// router.get("/getUserProfile/:userid",getUserProfile)
router.get("/getAllUsers",getAllUsers)

router.get("/searchUsers", searchUsers)

router.get("/getProfilePic/:userid", getProfilePic)
router.patch("/setProfilePic", upload.single("image"), setProfilePic)
router.patch("/setUserInfo", setUserInfo)
router.patch("/setUserBank", setUserBank)
router.patch("/setUserBusiness", setUserBusiness)
router.patch("/setAutomaticOptions",setAutomaticOptions)
router.patch("/switchRole",switchRole)



router.patch("/changePassword",changePassword)
router.patch("/createCustomer", upload.single("image"),createCustomer)


router.delete("/deleteUser", deleteUser);
router.get("/deleteUser", deleteUserByUsername);
router.get("/getUserProfile/:userid", getUserProfile);
router.get("/generateShareableProfileLink/:userId", generateShareableProfileLink);


module.exports = router

