import express from 'express';
import { sendMessage, getConversation, getRecentChats, deleteMessage } from '../controllers/chat.controller.js';

const router = express.Router();

// Send a message
router.post('/', sendMessage);

// Get conversation between two users
router.get('/conversation/:user1/:user2', getConversation);

// Get recent chats for a user
router.get('/recent/:userId', getRecentChats);

// Delete a message
router.delete('/:id', deleteMessage);

export default router;
