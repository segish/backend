const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cashier = require("../models/Cashier")
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();

var savedOTPs = {};
//login
const login = async (req, res) => {
    try {
        const Cashiers = await Cashier.findOne({ email: req.body.email });
        if (!Cashiers) return res.status(404).json("Incorect emiail or password");
        const validPssword = await bcrypt.compare(req.body.password, Cashiers.password)
        if (!validPssword) return res.status(400).json("Incorect emiail or password")
        const token = jwt.sign({ id: Cashiers.id }, process.env.JWT_SECRETE_KEY, {
            expiresIn: "1d"
        });  //temporary secrete key
        const { password, updatedAt, ...others } = Cashiers._doc;

        res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 1000 * 172800),  //to expire after 2 days
            httpOnly: true,
        }).status(200).json(others);
    } catch (err) {
        res.status(500).json("somthing went wrong!")
    }
}

//logout
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        // secure: true,
        // sameSite: "none"
    }).status(200).json("user has been loged out")
}//send otp

const forgotPwd = async (req, res) => {

    try {
        var otp = Math.floor(100000 + Math.random() * 900000);
        const phoneNumber = req.body.phone
        const exists = await Cashier.findOne({ phone: phoneNumber })
        if (!exists) return res.status(404).json("a cashier with this phone number is not found");
        savedOTPs[phoneNumber] = otp;
        setTimeout(() => {
            delete savedOTPs[phoneNumber];
        }, 180000);
        const payload = {
            username: process.env.OTP_USERNAME,
            password: process.env.OTP_PASSWORD,
            to: phoneNumber,
            message: otp,
            template_id: "otp",
        };
        const response = await axios.post('https://sms.yegara.com/api2/send', payload);
        if (response) {
            res.status(200).json("An OTP sent to your phone number " + phoneNumber);
        } else {
            res.status(500).json("Failed to send OTP");
        }

    } catch (error) {
        res.status(500).json("Failed to send OTP");
    }

}

// check otp

const otpChek = async (req, res) => {

    try {

        const { phone } = req.body
        const otp = parseInt(req.body.otp)
        if (savedOTPs[phone] !== otp) return res.status(404).json("incorrect otp or otp expired");

        else return res.status(200).json("correct");

    } catch (err) {
        return res.status(500).json("Somthing went wrong")
    }
}

//chek Otp and reset password

const resetPassword = async (req, res) => {

    try {

        const { phone, newPassword } = req.body
        const otp = parseInt(req.body.otp)
        if (savedOTPs[phone] !== otp) return res.status(404).json("incorrect otp");

        const exists = await Cashier.findOne({ phone: phone })
        if (!exists) return res.status(404).json("an admin with this phone number is not found");


        const salt = await bcrypt.genSalt(10);
        const hashedPssword = await bcrypt.hash(newPassword, salt);
        exists.password = hashedPssword

        await exists.save()

        return res.status(200).json("password has been reseted");

    } catch (err) {
        return res.status(500).json("Somthing went wrong")
    }
}

//change password
const changePwd = async (req, res) => {

    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Cashier.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("You cannot change password right now")

            const { oldPassword, newPassword } = req.body
            const validPssword = await bcrypt.compare(oldPassword, currentUser.password)
            if (!validPssword) return res.status(401).json("Incorrect password!")

            const salt = await bcrypt.genSalt(10);
            const hashedPssword = await bcrypt.hash(newPassword, salt);

            currentUser.password = hashedPssword

            await currentUser.save()

            return res.clearCookie("accessToken", {
                // secure: true,
                // sameSite: "none"
            }).status(200).json("passwored change success")

        } catch (err) {
            return res.status(500).json("Somthing went wrong")
        }
    })

}

//refresh user
const getCashier = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.clearCookie("accessToken", {
        // secure: true,
        // sameSite: "none"
    }) .status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const user = await Cashier.findById(userInfo.id);
            if (!user) return res.status(403).json("No account found!");
            const { password, updatedAt, ...others } = user._doc;
            res.status(200).json(others);
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

module.exports = { login, logout, getCashier, changePwd,otpChek,resetPassword,forgotPwd };
