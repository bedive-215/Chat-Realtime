import models from '../models/index.js';

const { Chat, ChatParticipant } = models;

export default {
    async creatChat(userId, friendId) {
        if (!friendId) {
            throw new Error('Required params', userId, friendId);
        }
        if (userId.toString() === friendId.toString()) {
            return {
                error: { code: 400, message: 'You cannot create a chat with yourself.' }
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
                return { result: { message: 'Private chat already exists', chat_id } };
            }
            const chat = await Chat.create({ is_group: false });
            await ChatParticipant.bulkCreate([
                { chat_id: chat.id, user_id: userId },
                { chat_id: chat.id, user_id: friendId }
            ]);

            const chat_id = chat.id
            return { result: { message: 'Private chat created', chat_id } };
        } catch {
            return {
                error: { code: 500, message: 'Error creating chat', detail: error.message }
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