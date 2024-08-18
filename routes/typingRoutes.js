const express = require('express')
const router = express.Router()

const {
    saveTestInfo
} = require("../controllers/typingController")


const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

router.post("/saveTestInfo", saveTestInfo);

module.exports = router

