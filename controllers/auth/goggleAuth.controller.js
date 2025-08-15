
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../../models/users.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = await User.create({
        name,
        email,
        password: sub, // can also use random string
        avatar: picture,
      });
    }

    // Generate JWT
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token: accessToken, message: "Google login successful" });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
// what is the use of googgleAuth02callback?