import User from "../../models/users.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js"; 

export const signup = async (req, res) => {

    const { firstName, lastName, userName, email, password } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !userName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });

    }

    //validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ userName });
        if (existingUsername) {
            return res.status(409).json({ message: "Username already taken" });
        }


        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = Date.now() + 1000 * 60 * 60;

        const user = new User({
            firstName,
            lastName,
            email,
            userName,
            password: hashedPassword,
            verified: false,
            verificationToken,
            verificationExpires
        })


        const savedUser = await user.save();

        //send email

        const verificationLink = `https://byway-hoce.onrender.com/api/auth/verify-email?token=${verificationToken}`;
        const html = `
      <h2>Hello ${firstName},</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
    `;

        await sendEmail(email, "Verify your email", html);
        console.log(" Email sent to", email);

        const userObj = savedUser.toObject();
        const { password: _, __v, verificationToken: __, verificationTokenExpires: ___, ...others } = userObj;

        return res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            user: others,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



