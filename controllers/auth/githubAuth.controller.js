import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../../models/users.model.js";

export const githubAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ message: "Failed to get access token" });
    }

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, login, email, name, avatar_url } = userResponse.data;

    // Find or create user
    let user = await User.findOne({ githubId: id });

    if (!user) {
      // Try to find by email if not found by githubId
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          // Link githubId to existing user
          user.githubId = id;
          await user.save();
        }
      }

      if (!user) {
        // Create new user
        const [firstName, ...lastNameParts] = name ? name.split(' ') : [login, ''];
        const lastName = lastNameParts.join(' ');

        user = await User.create({
          firstName,
          lastName,
          userName: login,
          email,
          password: id.toString(), // Use github id as password
          githubId: id,
          verified: true, // OAuth users are verified
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      message: "GitHub login successful",
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
    console.error("GitHub Auth Error:", error.message);
    res.status(500).json({ message: "GitHub authentication failed" });
  }
};