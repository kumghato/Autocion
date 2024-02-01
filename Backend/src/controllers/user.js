import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import 'dotenv/config';


export const createUser = async (req, res, next) => {
    try {
        const { fullname, email, phone, password } = req.body;
        const image = req.file
        if (!fullname || !email || !phone || !password) {
            return next(new ErrorHandler("Please add all fields", 400));
        }

        const validate = await User.find({
            $or: [{ email: email }, { phone: phone }],
        });
        if (validate.length === 0) {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                fullname: fullname,
                email: email,
                phone: phone,
                password: hashPassword,
                image: {
                    data: image.buffer,
                    contentType: image.originalname,
                }
            });
            if (user) {
                res.status(200).json({ status: 1, message: "Account created.", user });
            }
        } else {
            res.status(400).json({ status: 0, message: "User already exist." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }
};

export const getAllUser = async (req, res) => {
    try {
        const user = req.body;
        const users = await User.find(user);
        if (user) {
            res
                .status(200)
                .json({ status: 1, success: true, message: "Users list", users });
        } else {
            res
                .status(400)
                .json({ status: 0, success: false, message: "No users found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }
};

export const getUserbyId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return next(new ErrorHandler("Invalid Id", 400));
        }
        const { userAppointments } = req; // Fetched appointments are available in req.userAppointments
        const formattedAppointments = userAppointments.map(appointment => ({
            ...appointment._doc,
            brand: appointment.brand ? appointment.brand.name : 'N/A',
            model: appointment.model ? appointment.model.name : 'N/A',
            service: appointment.service ? appointment.service.name : 'N/A',
        }));

        res.status(200).json({ status: 1, success: true, message: `Hello ${user.fullname}`, user, Appointments: formattedAppointments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleteUser = await User.findByIdAndDelete(id);
        if (deleteUser) {
            return res.status(200).json({
                success: true,
                message: "Account deleted.",
            });
        }
        return next(new ErrorHandler("Invalid Id", 400));
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password, phone } = req.body;
        const checkUser = await User.findOne({
            $or: [{ email: email }, { phone: phone }],
        });
        if (checkUser) {
            const isMatched = await bcrypt.compare(password, checkUser.password);

            if (isMatched) {
                let token = jwt.sign(
                    { fullname: checkUser.fullname, _id: checkUser._id },
                    process.env.SECRET,
                    { expiresIn: "1h" }
                );
                const options = {
                    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                };
                res.cookie("token", token, options).status(201).json({
                    Status: 1,
                    success: true,
                    message: "Login successfull",
                    token: token,
                });
            } else {
                res
                    .status(401)
                    .json({ Status: 0, success: false, message: "Incorrect password" });
            }
        } else {
            res
                .status(401)
                .json({ Status: 0, success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = req.body;
        const image = req.file
        const validateUser = await User.findById(id)
        if (!validateUser) {
            return next(new ErrorHandler("Invalid Id", 400));
        }
        let updateFields = (user)
        if (image) {
            updateFields.image = {
                data: image.buffer,
                contentType: image.originalname,
            };
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });
        if (updatedUser) {
            res.status(200).json({ status: 1, success: true, message: "User details updated.", updatedUser, });
        } else {
            return next(new ErrorHandler("User details update failed.", 400));
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Error", error });
    }

};
