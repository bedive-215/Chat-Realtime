import Message from "../models/messages.model.js";
import models from "../models/index.js";
import { uploadBufferToCloudinary } from "../helpers/upload.helper.js";
import { Op } from "sequelize";
import redisHelper from "../helpers/redis.helper.js";

const { Chat, ChatParticipant, User } = models;

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
                    chatId,
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
    async sendMessage(senderId, receiverId, chatId, text, file, tempId = null) {
        try {
            const participants = await ChatParticipant.findAll({
                where: {
                    chat_id: chatId,
                    user_id: { [Op.or]: [senderId, receiverId] },
                },
            });

            if (!participants || participants.length < 2) {
                return {
                    error: {
                        code: 400,
                        name: "SendMessageError",
                        message: "You are not a participant of this chat",
                    },
                };
            }

            let mediaUrl = null;
            if (file) {
                if (file.buffer) {
                    const buffer = Buffer.isBuffer(file.buffer)
                        ? file.buffer
                        : Buffer.from(new Uint8Array(file.buffer));
                    mediaUrl = await uploadBufferToCloudinary(buffer, "chat_images");
                } else if (file.path) {
                    const uploaded = await cloudinary.uploader.upload(file.path, { folder: "chat_images" });
                    mediaUrl = uploaded.secure_url;
                }
            }

            const newMessage = await Message.create({
                chatId,
                senderId,
                content: text || "",
                image: mediaUrl,
            });

            return {
                result: {
                    message: newMessage.toJSON(),
                    tempId,
                },
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
