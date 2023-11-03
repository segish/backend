const router = require("express").Router();
const { addAdmin, login, logout, getAdmin, changePwd, deleteUser, getAll, updateUser, forgotPwd, resetPassword,otpChek } = require("../controllers/Auth.js")

router.post("/add", addAdmin)
router.post("/login", login)
router.post("/logout", logout)
router.post("/pwdchange", changePwd)
router.post("/refresh", getAdmin)
router.get("/getall", getAll)
router.delete("/delete/:id", deleteUser)
router.post("/update/:id", updateUser)
router.post("/forgot", forgotPwd)
router.post("/reset", resetPassword)
router.post("/otpcheck", otpChek)
module.exports = router;