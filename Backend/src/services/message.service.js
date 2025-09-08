import Message from "../models/messages.model.js";
import { uploadBufferToCloudinary } from "../helpers/upload.helper.js";

export default {
    async getMessage(chatId, { limit = 20, before } = {}) {
        try {
            if (!chatId) {
                return {
                    error: {
                        code: 400,
                        name: "GetMessagesError",
                        message: "Chat ID is required",
                    },
                };
            }

            const query = { chatId };

            if (before) {
                query.createdAt = { $lt: new Date(before) };
            }

            const messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return {
                result: {
                    name: "MessagesFetched",
                    message: "Messages retrieved successfully",
                    messages,
                },
            };
        } catch (error) {
            console.error("Error getMessages:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while fetching messages",
                },
            };
        }
    },
    async sendMessage(senderId, chatId, text, file) {
        try {
            let mediaUrl = null;

            if (file?.buffer) {
                const buffer = Buffer.isBuffer(file.buffer)
                    ? file.buffer
                    : Buffer.from(new Uint8Array(file.buffer));
                mediaUrl = await uploadBufferToCloudinary(buffer, "chat_images");
            }

            const newMessage = await Message.create({
                chatId,
                senderId,
                content: text || "",
                image: mediaUrl,
            });

            return {
                result: newMessage.toObject ? newMessage.toObject() : newMessage,
            };
        } catch (error) {
            console.error("Error send message:", error);
            return {
                error: {
                    code: 500,
                    name: "SendMessageError",
                    message: "Something went wrong while sending message",
                },
            };
        }
    }
};
