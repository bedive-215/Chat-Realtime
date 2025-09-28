import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    senderId: {
        type: Number,
        required: true
    },
    receiverId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;