import models from '../models/index.js';
import sequelize from '../configs/databaseConf.js';
import { Op } from 'sequelize';
import Sequelize from 'sequelize';
const { Chat, ChatParticipant } = models;

export default {
    async createChat(userId, friendId, transaction = null) {
        if (!userId || !friendId) {
            throw new Error(`Required params: userId=${userId}, friendId=${friendId}`);
        }

        if (userId.toString() === friendId.toString()) {
            return {
                error: { code: 400, message: "You cannot create a chat with yourself." }
            };
        }

        try {
            const existingChat = await ChatParticipant.findAll({
                where: {
                    user_id: { [Op.in]: [userId, friendId] }
                },
                attributes: ["chat_id"],
                group: ["chat_id"],
                having: Sequelize.literal("COUNT(DISTINCT user_id) = 2"),
                include: [{
                    model: Chat,
                    where: { is_group: false },
                    attributes: []
                }],
                transaction
            });

            if (existingChat.length > 0) {
                const chatId = existingChat[0].chat_id;
                return { result: { message: "Private chat already exists", chatId } };
            }

            const chat = await sequelize.transaction(async (t) => {
                const newChat = await Chat.create({ is_group: false }, { transaction: t });
                await ChatParticipant.bulkCreate(
                    [
                        { chat_id: newChat.id, user_id: userId },
                        { chat_id: newChat.id, user_id: friendId }
                    ],
                    { transaction: t }
                );
                return newChat;
            })
            return { result: { message: "Private chat created", chatId: chat.id } };

        } catch (error) {
            return {
                error: { code: 500, message: "Error creating chat", detail: error.message }
            };
        }
    },

    async getChatId(userId, friendId) {
        if (!userId || !friendId) {
            return {
                error: { code: 400, message: 'Required ids of user and friend' }
            };
        }

        try {
            const existingChat = await ChatParticipant.findAll({
                where: {
                    user_id: { [Op.in]: [userId, friendId] }
                },
                attributes: ['chat_id'],
                group: ['chat_id'],
                having: Sequelize.literal('COUNT(DISTINCT user_id) = 2'),
                include: [{
                    model: Chat,
                    where: { is_group: false },
                    attributes: []
                }]
            });

            if (existingChat.length > 0) {
                const chat_id = existingChat[0].chat_id;
                return { result: { chat_id } };
            }

            return {
                error: { code: 404, message: 'Chat not found' }
            };

        } catch (error) {
            return {
                error: { code: 500, message: 'Error get chat id', detail: error.message }
            };
        }
    }
}