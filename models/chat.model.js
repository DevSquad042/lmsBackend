import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    default: '' 
  },
  isAdminMessage: { 
    type: Boolean, 
    default: false 
  },
  // allowing  File sending (pdf, png, docx, etc.)
  attachments: [
    {
      fileName: String,
      fileType: String, 
      fileUrl: String
    }
  ],
  // 🎙️ Voice note 
  voiceNote: {
    fileUrl: String,
    duration: Number 
  }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
