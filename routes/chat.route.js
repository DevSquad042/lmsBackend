import express from "express";
import { sendMessage, getConversation } from "../controllers/chat.controller.js";

const router = express.Router();

// Send a new message
router.post("/send", sendMessage);

// Get conversation between two users
router.get("/:userId/:receiverId", getConversation);

export default router;
