import models from "../models/index.js";
import { Op } from "sequelize";
import chatService from './chat.service.js';
import redis from '../configs/redisConf.js';

const { User, Friend, Chat, ChatParticipant } = models;

export default {
    async updateFriendshipCache(userId, friendId, action) {
        const friendKeyUser = `friends:${userId}`;
        const friendKeyTarget = `friends:${friendId}`;
        const infoKeyUser = `friends_info:${userId}`;
        const infoKeyTarget = `friends_info:${friendId}`;

        const pipeline = redis.multi();

        if (action === "accept") {
            // Update friend ID set
            pipeline.sAdd(friendKeyUser, String(friendId));
            pipeline.sAdd(friendKeyTarget, String(userId));

            // Lấy info từ DB
            const [user, friend] = await Promise.all([
                User.findByPk(userId, { attributes: { exclude: ["password"] } }),
                User.findByPk(friendId, { attributes: { exclude: ["password"] } })
            ]);

            if (user && friend) {
                pipeline.hSet(infoKeyUser, String(friend.id), JSON.stringify(friend));
                pipeline.hSet(infoKeyTarget, String(user.id), JSON.stringify(user));
            }

        } else if (action === "unfriend") {
            // Remove from friend sets
            pipeline.sRem(friendKeyUser, String(friendId));
            pipeline.sRem(friendKeyTarget, String(userId));

            // Remove from info hashes
            pipeline.hDel(infoKeyUser, String(friendId));
            pipeline.hDel(infoKeyTarget, String(userId));
        }

        // TTL (7 ngày)
        const ttl = 60 * 60 * 24 * 7;
        pipeline.expire(friendKeyUser, ttl);
        pipeline.expire(friendKeyTarget, ttl);
        pipeline.expire(infoKeyUser, ttl);
        pipeline.expire(infoKeyTarget, ttl);

        await pipeline.exec();
    },

    async fallBackDB(userId) {
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                [Op.or]: [{ requester_id: userId }, { receiver_id: userId }]
            },
            include: [
                { model: User, as: "requester", attributes: ['id', 'username', 'profile_avatar'] },
                { model: User, as: "receiver", attributes: ['id', 'username', 'profile_avatar'] }
            ],
            order: [["created_at", "DESC"]]
        });
        return friends;
    },
    // ================== Lấy danh sách bạn ==================
    async getFriends(userId) {
        if (!userId) {
            return {
                error: { code: 400, name: "GetFriendsError", message: "User ID is required" }
            };
        }

        const key = `friends:${userId}`;
        const friendIds = await redis.sMembers(key);

        if (friendIds.length > 0) {
            return { result: friendIds.map(id => Number(id)), source: "cache" };
        }

        // Fallback DB
        const friends = await this.fallBackDB(userId);

        // Lấy danh sách ID bạn bè (chỉ id)
        const friendIdsFromDB = friends.map(f =>
            f.requester_id === userId ? f.receiver_id : f.requester_id
        );

        if (friendIdsFromDB.length > 0) {
            const pipeline = redis.multi();
            pipeline.sAdd(key, ...friendIdsFromDB.map(id => String(id)));
            pipeline.expire(key, 60 * 60 * 24 * 7); // TTL 7 ngày
            await pipeline.exec();
        }

        return { result: friendIdsFromDB, source: "db" };
    },

    // ================== Lấy info bạn bè ==================
    async getFriendsInfo(userId) {
        if (!userId) {
            return {
                error: { code: 400, name: "GetFriendInfoError", message: "User ID is required" }
            };
        }

        const key = `friends_info:${userId}`;
        const cached = await redis.hVals(key);

        if (cached.length > 0) {
            try {
                return { result: cached.map(f => JSON.parse(f)), source: "cache" };
            } catch (err) {
                console.error("Cache parse error, rebuilding:", err.message);
                await redis.del(key);
            }
        }

        // === Fallback DB ===
        const friends = await this.fallBackDB(userId);

        const friendList = await Promise.all(
            friends.map(async f => {
                const friend = f.requester_id === userId ? f.receiver : f.requester;

                // lấy chat riêng
                const chat = await Chat.findOne({
                    where: { is_group: false },
                    include: [{
                        model: ChatParticipant,
                        where: { user_id: { [Op.in]: [userId, friend.id] } },
                        required: true
                    }]
                });

                let lastMessage = null;
                let chatId = null;

                if (chat) {
                    const participants = await ChatParticipant.count({ where: { chat_id: chat.id } });
                    if (participants === 2) {
                        chatId = chat.id;
                    }
                }

                return {
                    ...friend.toJSON(),
                    chatId,
                    lastMessage: lastMessage
                        ? {
                            id: lastMessage.id,
                            text: lastMessage.text,
                            createdAt: lastMessage.created_at
                        }
                        : null,
                    unreadCount: 0,
                };
            })
        );

        // Cache vào Redis
        if (friendList.length > 0) {
            const pipeline = redis.multi();
            friendList.forEach(friend => {
                pipeline.hSet(key, String(friend.id), JSON.stringify(friend));
            });
            pipeline.expire(key, 60 * 60 * 24 * 7);
            await pipeline.exec();
        }

        return { result: friendList, source: "db" };
    },
    // ================== Gửi lời mời ==================
    async sendFriendRequest(userId, friendId) {
        if (!userId || !friendId) {
            return { error: { code: 400, name: "FriendError", message: "User ID and Friend ID are required" } };
        }

        if (userId === friendId) {
            return { error: { code: 400, name: "FriendError", message: "You cannot add yourself" } };
        }

        const existing = await Friend.findOne({
            where: {
                [Op.or]: [
                    { requester_id: userId, receiver_id: friendId },
                    { requester_id: friendId, receiver_id: userId }
                ]
            }
        });

        if (existing) {
            if (existing.status === "pending") return { error: { code: 400, message: "Friend request already sent" } };
            if (existing.status === "accepted") return { error: { code: 400, message: "Already friends" } };
        }

        const request = await Friend.create({ requester_id: userId, receiver_id: friendId, status: "pending" });
        return { result: request };
    },

    // ================== Chấp nhận ==================
    async acceptFriendRequest(userId, requesterId) {
        const t = await sequelize.transaction();
        try {
            const request = await Friend.findOne({
                where: { requester_id: requesterId, receiver_id: userId, status: "pending" },
                include: [
                    { model: User, as: "requester", attributes: { exclude: ["password"] } },
                    { model: User, as: "receiver", attributes: { exclude: ["password"] } }
                ],
                transaction: t
            });

            if (!request) {
                await t.rollback();
                return { error: { code: 404, name: "FriendError", message: "Friend request not found" } };
            }

            request.status = "accepted";
            await request.save({ transaction: t });

            // tạo chat trong transaction
            await chatService.createChat(userId, requesterId, t);

            // update cache (nên làm sau khi commit)
            await t.commit();
            await this.updateFriendshipCache(userId, requesterId, "accept");

            return { result: request };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    // ================== Từ chối ==================
    async rejectFriendRequest(userId, requesterId) {
        const request = await Friend.findOne({
            where: { requester_id: requesterId, receiver_id: userId, status: "pending" }
        });

        if (!request) {
            return { error: { code: 404, name: "FriendError", message: "Friend request not found" } };
        }

        await request.destroy();
        return { result: { message: "Friend request rejected" } };
    },

    // ================== Hủy lời mời ==================
    async cancelFriendRequest(userId, friendId) {
        const request = await Friend.findOne({
            where: { requester_id: userId, receiver_id: friendId, status: "pending" }
        });

        if (!request) {
            return { error: { code: 404, name: "FriendError", message: "Friend request not found or already handled" } };
        }

        await request.destroy();
        return { result: { message: "Friend request canceled" } };
    },

    // ================== Hủy kết bạn ==================
    async unfriend(userId, friendId) {
        const friendship = await Friend.findOne({
            where: {
                status: "accepted",
                [Op.or]: [
                    { requester_id: userId, receiver_id: friendId },
                    { requester_id: friendId, receiver_id: userId }
                ]
            }
        });

        if (!friendship) {
            return { error: { code: 404, name: "FriendError", message: "Friendship not found" } };
        }

        await friendship.destroy();
        await this.updateFriendshipCache(userId, friendId, "unfriend");

        return { result: { message: "Unfriended successfully" } };
    }
};
