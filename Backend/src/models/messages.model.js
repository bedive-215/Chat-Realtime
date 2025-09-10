import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
      type: Number,
      required: true
    },
    senderId: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    }
  }, { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;