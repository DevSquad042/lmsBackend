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
        // Find user by email or username
        const user = await User.findOne({ $or: [{ email }, { userName }] });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.verified) {
            return res.status(403).json({ message: "Account not verified. Please check your email." });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // Send success response
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userName: user.userName,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error("Error while logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
