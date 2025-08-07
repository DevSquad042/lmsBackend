import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/users.model.js";


export const login = async (req, res) => {
    const { email, userName, password } = req.body;

    if (!email && !userName) {
        return res.status(400).json({ message: "Email or Username is required" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const user = await User.findOne({ $or: [{ email }, { userName }] });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.verified) {
            return res.status(403).json({ message: "User not verified" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        //  Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        //  Set JWT in a secure cookie
        res.cookie("token", token, {
            httpOnly: true,                          // cannot be accessed by frontend JS
            secure: process.env.NODE_ENV === "production", // send cookie over HTTPS only in production
            sameSite: "Strict",                      // prevent CSRF attacks
            maxAge: 60 * 60 * 1000                   // 1 hour
        });

          
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userName: user.userName,
                role: user.role
            }
        });


    } catch (error) {
        console.error("error while loging in:", error);
        res.status(500).json({ message: "Internal server error while logging in" });
    }
};