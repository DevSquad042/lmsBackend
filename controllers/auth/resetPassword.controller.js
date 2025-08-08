import User from "../../models/users.model.js";
import bcrypt from "bcryptjs";


export const resetPassword = async (req, res) => {
    const {token} = req.query
    const {new_password} = req.body

    if (!token) {
    return res.status(400).json({ message: "Token is missing." });
  }

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters." });
  }

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });  
      
    }

    const newhashedPassword = await bcrypt.hash(new_password, 10);
    user.password = newhashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "An error occurred while resetting the password." });
  }

}