import models from "../models/index.js";
import sequelize from "../configs/databaseConf.js";
import Message from "../models/messages.model.js";
import { Op } from "sequelize";
import chatService from './chat.service.js';
import redisHelper from "../helpers/redis.helper.js";
import redis from "../configs/redisConf.js";
import notificationService from "./notification.service.js";

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
        console.log(`Fetched ${friends.length} friends from DB for user ${userId}`);
        const friendList = await Promise.all(
            friends.map(async (f) => {
                const friend = f.requester_id === userId ? f.receiver : f.requester;

                let chatId = null;
                let lastMessage = null;

                // lấy tất cả chats có 2 participants
                const allChats = await Chat.findAll({
                    where: { is_group: false },
                    include: [
                        {
                            model: ChatParticipant,
                            as: "participants",
                            attributes: ["user_id"],
                            required: true,
                        },
                    ],
                });

                const correctChat = allChats.find((chat) => {
                    const participantIds = chat.participants.map((p) => p.user_id);
                    return (
                        participantIds.length === 2 &&
                        participantIds.includes(userId) &&
                        participantIds.includes(friend.id)
                    );
                });

                if (correctChat) {
                    chatId = correctChat.id;

                    // Ép kiểu sang Number nếu DB Mongo lưu là số
                    lastMessage = await Message.findOne({ chatId: Number(chatId) })
                        .sort({ createdAt: -1 })
                        .lean();
                }

                let lastMessageText = "No messages yet";
                if (lastMessage) {
                    if (lastMessage.content && lastMessage.content.trim() !== "") {
                        lastMessageText = lastMessage.content;
                    } else if (lastMessage.image) {
                        lastMessageText = "image";
                    }
                }

                return {
                    id: friend.id,
                    username: friend.username,
                    profile_avatar: friend.profile_avatar,
                    chatId,
                    lastMessage: lastMessageText,
                    unreadCount: 0,
                };
            })
        );

        return { friends, friendList };
    },

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
        console.log(`Fetched ${friendIdsFromDB.length} friend IDs from DB for user ${userId}`);
        console.log("Friend IDs:", friendIdsFromDB);
        if (friendIdsFromDB.length > 0) {
            const pipeline = redis.multi();
            pipeline.sAdd(key, friendIdsFromDB.map(String));
            pipeline.expire(key, 60 * 60 * 24 * 7); 
            const results = await pipeline.exec();
            console.log("Redis pipeline results:", results);
        }

        return { result: friendIdsFromDB, source: "db" };
    },

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

        const requester = await User.findByPk(userId);
        const request = await Friend.create({ requester_id: userId, receiver_id: friendId, status: "pending" });

        let notification = null;
        if (request) {
            try {
                notification = await notificationService.createNotification(
                    userId,
                    friendId,
                    'friend_request',
                    `You have a new friend request from ${requester?.username || "Someone"}`
                );
            } catch (err) {
                console.error("Notification creation error:", err);
            }
        }
        return { result: { request, notification } };
    },

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

            const chatId = await chatService.createChat(userId, requesterId, t);

            await t.commit();
            await redisHelper.updateFriendshipCache(userId, requesterId, chatId, "accept");

            const notification = await notificationService.createNotification(
                userId,
                requesterId,
                'friend_request_accepted',
                'Your friend request has been accepted by ' + (request.receiver?.username || "Someone")
            );

            return { result: { request, notification } };
        } catch (err) {
            await t.rollback();
            console.error("acceptFriendRequest error:", err);
            throw err;
        }
    },

    async rejectFriendRequest(userId, requesterId) {
        const request = await Friend.findOne({
            where: { requester_id: requesterId, receiver_id: userId, status: "pending" }
        });

        if (!request) {
            return { error: { code: 404, name: "FriendError", message: "Friend request not found" } };
        }

        await request.destroy();
        const receiver = await User.findByPk(userId);
        const notification = await notificationService.createNotification(
            userId,
            requesterId,
            'friend_request_rejected',
            'Your friend request has been rejected by ' + (receiver?.username || "Someone")
        );

        return { result: { message: "Friend request rejected", notification } };
    },

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

    async getFriendRequests(userId) {
        try {
            if (!userId) {
                return {
                    error: { code: 400, name: "GetFriendRequestsError", message: "User ID is required" }
                };
            }
            const requests = await Friend.findAll({
                where: { receiver_id: userId, status: "pending" },
                include: [
                    { model: User, as: "requester", attributes: { exclude: ["password"] } }
                ],
                order: [["created_at", "DESC"]],
            });
            return { result: requests };
        } catch (err) {
            console.error("getFriendRequests service error:", err);
            return { error: { code: 500, name: "ServerError", message: "Internal server error" } };
        }
    }
};
