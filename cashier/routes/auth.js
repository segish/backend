const router = require("express").Router();
const { login, logout, changePwd, getCashier,forgotPwd,otpChek,resetPassword } = require("../controllers/Auth.js")

router.post("/login", login)
router.post("/logout", logout)
router.post("/pwdchange/:id", changePwd)
router.post("/refresh", getCashier)
router.post("/forgot", forgotPwd)
router.post("/reset", resetPassword)
router.post("/otpcheck", otpChek)
module.exports = router;