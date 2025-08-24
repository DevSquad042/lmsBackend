import Chat from '../models/chat.model.js';

// ✅ Create a new chat message
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message, attachments, voiceNote, isAdminMessage } = req.body;

    const chat = new Chat({
      sender,
      receiver,
      message,
      attachments,
      voiceNote,
      isAdminMessage
    });

    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all chats between two users
export const getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const chats = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get recent chats for a user
export const getRecentChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete a chat message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await chat.deleteOne();

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
