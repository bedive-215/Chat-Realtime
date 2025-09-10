import redis from '../configs/redisConf.js';
import models from '../models/index.js';

const { User } = models;

export default {
    async updateFriendshipCache(userId, friendId, chatId, action) {
        const friendKeyUser = `friends:${userId}`;
        const friendKeyTarget = `friends:${friendId}`;
        const infoKeyUser = `friends_info:${userId}`;
        const infoKeyTarget = `friends_info:${friendId}`;

        const pipeline = redis.multi();

        switch (action) {
            case "accept": {
                // Add vào friend set
                pipeline.sAdd(friendKeyUser, String(friendId));
                pipeline.sAdd(friendKeyTarget, String(userId));

                // Lấy info từ DB
                const [user, friend] = await Promise.all([
                    User.findByPk(userId, { attributes: { exclude: ["password"] } }),
                    User.findByPk(friendId, { attributes: { exclude: ["password"] } })
                ]);

                const payload = { chatId, lastMessage: null, unreadCount: 0 };

                if (user && friend) {
                    const userObj = { ...user.toJSON(), ...payload };
                    const friendObj = { ...friend.toJSON(), ...payload };

                    pipeline.hSet(infoKeyUser, String(friend.id), JSON.stringify(friendObj));
                    pipeline.hSet(infoKeyTarget, String(user.id), JSON.stringify(userObj));
                }
                break;
            }

            case "unfriend": {
                // Remove khỏi friend set
                pipeline.sRem(friendKeyUser, String(friendId));
                pipeline.sRem(friendKeyTarget, String(userId));

                // Remove khỏi info
                pipeline.hDel(infoKeyUser, String(friendId));
                pipeline.hDel(infoKeyTarget, String(userId));
                break;
            }
        }

        // TTL 7 ngày
        const ttl = 60 * 60 * 24 * 7;
        pipeline.expire(friendKeyUser, ttl);
        pipeline.expire(friendKeyTarget, ttl);
        pipeline.expire(infoKeyUser, ttl);
        pipeline.expire(infoKeyTarget, ttl);

        await pipeline.exec();
    },

    async updateLastMessageCache(senderId, receiverId, messageText) {
        const senderInfoKey = `friends_info:${senderId}`;
        const receiverInfoKey = `friends_info:${receiverId}`;

        const [senderFriendJson, receiverFriendJson] = await Promise.all([
            redis.hGet(senderInfoKey, String(receiverId)),
            redis.hGet(receiverInfoKey, String(senderId)),
        ]);

        if (senderFriendJson) {
            const senderFriend = JSON.parse(senderFriendJson);
            senderFriend.lastMessage = messageText;
            senderFriend.unreadCount = 0;
            await redis.hSet(senderInfoKey, String(receiverId), JSON.stringify(senderFriend));
        }

        if (receiverFriendJson) {
            const receiverFriend = JSON.parse(receiverFriendJson);
            receiverFriend.lastMessage = messageText;
            receiverFriend.unreadCount = (receiverFriend.unreadCount || 0) + 1;
            await redis.hset(receiverInfoKey, String(senderId), JSON.stringify(receiverFriend));
        }
    },

    async resetUnreadCount(userId, friendId) {
        const infoKeyUser = `friends_info:${userId}`;
        const friendJson = await redis.hGet(infoKeyUser, String(friendId));

        if (friendJson) {
            const friendObj = JSON.parse(friendJson);
            friendObj.unreadCount = 0;
            await redis.hSet(infoKeyUser, String(friendId), JSON.stringify(friendObj));
        }
    },

    async getUnreadCount(userId, friendId) {
        const key = `friends_info:${userId}`;
        const data = await redisClient.hget(key, friendId.toString());
        if (!data) return 0;

        const parsed = JSON.parse(data);
        return parsed.unreadCount || 0;
    }
};