import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { 
    type: Number, // tham chiếu đến `chats.id` trong MySQL
    required: true 
  },
  senderId: { 
    type: Number, // tham chiếu đến `users.id` trong MySQL
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ["text", "image", "video", "file"], 
    default: "text" 
  },
  mediaUrl: { 
    type: String, 
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Tạo index để tối ưu query theo chat
messageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
