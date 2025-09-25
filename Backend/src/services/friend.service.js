import models from "../models/index.js";
import sequelize from "../configs/databaseConf.js";
import Message from "../models/messages.model.js";
import Notification from "../models/notifications.model.js";
import { Op } from "sequelize";
import chatService from './chat.service.js';
import redisHelper from "../helpers/redis.helper.js";
import redis from "../configs/redisConf.js";
import norificationService from "./norification.service.js";

const { User, Friend, Chat, ChatParticipant } = models;

export default {
    async fallBackDB(userId) {
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                [Op.or]: [
                    { requester_id: userId },
                    { receiver_id: userId }
                ]
            },
            include: [
                { model: User, as: "requester", attributes: ["id", "username", "profile_avatar"] },
                { model: User, as: "receiver", attributes: ["id", "username", "profile_avatar"] }
            ],
            order: [["created_at", "DESC"]],
        });

        const friendList = await Promise.all(
            friends.map(async f => {
                const friend = f.requester_id === userId ? f.receiver : f.requester;
                const chat = await Chat.findOne({
                    where: { is_group: false },
                    include: [
                        {
                            model: ChatParticipant,
                            as: "participants",
                            attributes: ["user_id"],
                            required: true
                        }
                    ]
                });

                let chatId = null;
                let lastMessage = null;

                if (chat) {
                    const allChats = await Chat.findAll({
                        where: { is_group: false },
                        include: [
                            {
                                model: ChatParticipant,
                                as: "participants",
                                attributes: ["user_id"],
                                required: true
                            }
                        ]
                    });

                    const correctChat = allChats.find(chat => {
                        const participantIds = chat.participants.map(p => p.user_id);
                        return participantIds.length === 2 &&
                            participantIds.includes(userId) &&
                            participantIds.includes(friend.id);
                    });

                    if (correctChat) {
                        chatId = correctChat.id;
                        lastMessage = await Message.findOne({ chatId })
                            .sort({ createdAt: -1 })
                            .lean();
                    }
                }

                return {
                    id: friend.id,
                    username: friend.username,
                    profile_avatar: friend.profile_avatar,
                    chatId,
                    lastMessage: lastMessage
                        ? {
                            id: lastMessage._id.toString(),
                            text: lastMessage.content,
                            createdAt: lastMessage.createdAt,
                            image: lastMessage.image || null,
                        }
                        : null,
                    unreadCount: 0,
                };
            })
        );

        console.log("Fallback DB executed for user:", friendList);
        return { friends, friendList };
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
        const { friends } = await this.fallBackDB(userId);

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
        const { friendList } = await this.fallBackDB(userId);

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
        if(request) {
            await Notification.createNotification(userId, friendId, 'friend_request', 'You have a new friend request');
        }
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
            const chatId = await chatService.createChat(userId, requesterId, t);
            // update cache (nên làm sau khi commit)
            await t.commit();
            await Notification.createNotification(requesterId, userId, 'friend_request_accepted', 'Your friend request has been accepted');
            await redisHelper.updateFriendshipCache(userId, requesterId, chatId, "accept");

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
        await redisHelper.updateFriendshipCache(userId, friendId, null, "unfriend");

        return { result: { message: "Unfriended successfully" } };
    },
};
