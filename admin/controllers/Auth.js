const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Cashier = require("../models/Cashier");
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();

var savedOTPs = {};
//add admin

const addAdmin = async (req, res) => {

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("only admin can add admin")
            if (currentUser.type != "admin") return res.status(403).json("only admin can add admin")
            const salt = await bcrypt.genSalt(10);
            const hashedPssword = await bcrypt.hash(req.body.password, salt);
            //create new admin
            if (req.body.type === "admin") {
                const existingEmail = await Admin.findOne({ email: req.body.email });
                if (existingEmail) return res.status(403).json("email already exists");
                const existingphone = await Admin.findOne({ phone: req.body.phone });
                if (existingphone) return res.status(403).json("phone already exists");
                const newUser = new Admin({
                    adminName: req.body.adminName,
                    email: req.body.email,
                    phone: req.body.phone,
                    type: req.body.type,
                    password: hashedPssword,
                });

                const admin = await newUser.save();
            } else {
                const existingEmail = await Cashier.findOne({ email: req.body.email });
                if (existingEmail) return res.status(403).json("email already exists");
                const existingphone = await Cashier.findOne({ phone: req.body.phone });
                if (existingphone) return res.status(403).json("phone already exists");
                const newUser = new Cashier({
                    adminName: req.body.adminName,
                    email: req.body.email,
                    phone: req.body.phone,
                    profile: req.body.profile,
                    type: req.body.type,
                    warehouseName: req.body.warehouseName,
                    isSubstore: req.body.isSubstore || false,
                    password: hashedPssword,
                });

                const admin = await newUser.save();
            }
            res.status(200).json("added");
        } catch (err) {
            res.status(500).json("somthing went wrong!")
        }
    })
}

//login

const login = async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) return res.status(404).json("Incorect emiail or password");
        const validPssword = await bcrypt.compare(req.body.password, admin.password)
        if (!validPssword) return res.status(400).json("Incorect emiail or password")
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRETE_KEY, {
            expiresIn: "1d"
        });  //temporary secrete key
        const { password, updatedAt, ...others } = admin._doc;

        res.cookie("adminAccessToken", token, {
            expires: new Date(Date.now() + 1000 * 172800),  //to expire after 2 days
            httpOnly: true,
        }).status(200).json(others);
    } catch (err) {
        res.status(500).json("somthing went wrong!")
    }
}

//logout
const logout = (req, res) => {
    res.clearCookie("adminAccessToken", {
        // secure: true,
        // sameSite: "none"
    }).status(200).json("user has been loged out")
}


//send otp

const forgotPwd = async (req, res) => {

    try {
        var otp = Math.floor(100000 + Math.random() * 900000);
        const phoneNumber = req.body.phone
        const exists = await Admin.findOne({ phone: phoneNumber })
        if (!exists) return res.status(404).json("an admin with this phone number is not found");
        savedOTPs[phoneNumber] = otp;
        setTimeout(() => {
            delete savedOTPs[phoneNumber];
        }, 600000);
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

        const exists = await Admin.findOne({ phone: phone })
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

    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const currentUser = await Admin.findById(userInfo.id);
            if (!currentUser) return res.status(403).json("unable to change password")

            const { oldPassword, newPassword } = req.body
            const validPssword = await bcrypt.compare(oldPassword, currentUser.password)
            if (!validPssword) return res.status(401).json("Incorrect password!")

            const salt = await bcrypt.genSalt(10);
            const hashedPssword = await bcrypt.hash(newPassword, salt);

            currentUser.password = hashedPssword

            await currentUser.save()

            return res.clearCookie("adminAccessToken", {
                // secure: true,
                // sameSite: "none"
            }).status(200).json("passwored change success")

        } catch (err) {
            return res.status(500).json("Somthing went wrong")
        }
    })

}

//updat user
const updateUser = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can update Users")
        if (currentUser.type != "admin") return res.status(403).json("only admin can update Users!")
        const tobeUpdated = req.params.id;

        try {
            const updateFields = { ...req.body };
            if (updateFields.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPssword = await bcrypt.hash(req.body.password, salt);
                updateFields.password = hashedPssword;
            }

            const type = req.body.type;

            if (type === "admin") {
                const existingEmail = await Admin.findOne({ email: req.body.email });
                if (existingEmail && existingEmail._id.toString() !== tobeUpdated) return res.status(403).json("email already exists");
                const existingphone = await Admin.findOne({ phone: req.body.phone });
                if (existingphone && existingphone._id.toString() !== tobeUpdated) return res.status(403).json("phone already exists");
                await Admin.findByIdAndUpdate(tobeUpdated, {
                    $set: updateFields,
                })
            } else {
                const existingEmail = await Cashier.findOne({ email: req.body.email });
                if (existingEmail && existingEmail._id.toString() !== tobeUpdated) return res.status(403).json("email already exists");
                const existingphone = await Cashier.findOne({ phone: req.body.phone });
                if (existingphone && existingphone._id.toString() !== tobeUpdated) return res.status(403).json("phone already exists");
                Cashier.findByIdAndUpdate(tobeUpdated, {
                    $set: updateFields,
                })
            }
            res.status(200).json("updated");
        } catch (err) {
            return res.status(500).json("somthing went wrong!")
        }
    })
}


//refresh user

const getAdmin = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        try {
            const user = await Admin.findById(userInfo.id);
            if (!user) return res.status(403).json("No account found!");
            const { password, updatedAt, ...others } = user._doc;
            res.status(200).json(others);
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}
//delete User
const deleteUser = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can delete users!")
        if (currentUser.type != "admin") return res.status(403).json("only admin can delete user")
        try {
            const type = req.body.type;
            if (type === "admin") {
                await Admin.findByIdAndDelete(req.params.id);
            } else {
                await Cashier.findByIdAndDelete(req.params.id);
            }
            res.status(200).json("User has been deleted");
        } catch (err) {
            return res.status(500).json("somthing went wrong!");
        }
    });
}

//get all users
const getAll = async (req, res) => {
    const token = req.cookies.adminAccessToken;
    if (!token) return res.status(401).json("You must login first!");

    jwt.verify(token, process.env.JWT_SECRETE_KEY, async (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const currentUser = await Admin.findById(userInfo.id);
        if (!currentUser) return res.status(403).json("only admin can access users")
        if (currentUser.type != "admin") return res.status(403).json("only admin can access users")
        try {
            const admins = await Admin.find();
            const cashiers = await Cashier.find();
            const users = admins.concat(cashiers)
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json("somthing went wrong!");
        }
    })
}

module.exports = { addAdmin, login, logout, getAdmin, changePwd, deleteUser, getAll, updateUser, forgotPwd, resetPassword, otpChek };
