import Chat from "../models/chat.model.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message, isAdminMessage } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Chat({
      sender,
      receiver,
      message,
      isAdminMessage: isAdminMessage || false,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages between two users
export const getConversation = async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).populate("sender receiver", "name email");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
