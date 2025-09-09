import User from "../../models/users.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js"; 

export const signup = async (req, res) => {

    const { firstName, lastName, userName, email, password } = req.body;

    // Trim and lowercase inputs
    let trimmedEmail = email ? email.trim().toLowerCase() : "";
    let trimmedUserName = userName ? userName.trim().toLowerCase() : "";

    // Check if all required fields are provided
    if (!firstName || !lastName || !trimmedUserName || !trimmedEmail || !password) {
        return res.status(400).json({ message: "All fields are required" });

    }

    //validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    try {
        const existingEmail = await User.findOne({ email: new RegExp('^' + trimmedEmail + '$', 'i') });
        if (existingEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ userName: new RegExp('^' + trimmedUserName + '$', 'i') });
        if (existingUsername) {
            return res.status(409).json({ message: "Username already taken" });
        }


        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            firstName,
            lastName,
            email: trimmedEmail,
            userName: trimmedUserName,
            password: hashedPassword,
            verified: false, // Disabled email verification
        })


        const savedUser = await user.save();

        // Email verification disabled - no email sent

        const userObj = savedUser.toObject();
        const { password: _, __v, ...others } = userObj;

        return res.status(201).json({
            message: "User registered successfully.",
            user: others,
        });
    } catch (error) {
        console.error("Error registering user:", error);

        // // Handle MongoDB duplicate key errors
        // if (error.code === 11000) {
        //     const field = Object.keys(error.keyValue)[0];
        //     if (field === 'email') {
        //         return res.status(409).json({ message: "Email already in use" });
        //     } else if (field === 'userName') {
        //         return res.status(409).json({ message: "Username already taken" });
        //     }
        // }

        return res.status(500).json({ message: "Internal server error" });
    }
};



