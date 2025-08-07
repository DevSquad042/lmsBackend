import User from "../../models/users.model.js";

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ message: "Verification token has expired." });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
