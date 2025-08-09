import User from "../../models/users.model.js"
import crypto from 'crypto';
import sendEmail from '../../utils/sendEmail.js';

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not found in the database" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;

        await user.save();

        // email content

        const resetlink = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`

        const html = `
        <h2>hello ${user.firstName},</h2>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <a href="${resetlink}">Reset Password</a>
        `

        await sendEmail(email, "Reset Your Password", html); 


        res.status(200).json({ message: "Reset link sent to your email." });
    } catch (error) {
        console.error("Error during forgot password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}