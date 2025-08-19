import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

export const authMiddleware = async(req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('No token found');
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded.userId; // or req.user = decoded if you store full user object
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
}

