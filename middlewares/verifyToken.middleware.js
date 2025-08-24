import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            userName: user.userName,
            role: user.role
        };

        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

