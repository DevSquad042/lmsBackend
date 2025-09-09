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

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = Date.now() + 1000 * 60 * 60;

        

        const user = new User({
            firstName,
            lastName,
            email: trimmedEmail,
            userName: trimmedUserName,
            password: hashedPassword,
            verified: false, // Disabled email verification
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

        return res.status(500).json({ message: "Internal server error" });
    }
    catch(err){
        console.error("server error during signup:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};



