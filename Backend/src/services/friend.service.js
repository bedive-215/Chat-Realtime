import models from "../models/index.js";
import { Op } from "sequelize";
import chatService from './chat.service.js';
import redis from '../configs/redisConf.js';

const { User, Friend } = models;

export default {
    // ================== Helpers ==================
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
            return { result: friendIds.map(id => ({ id: Number(id) })), source: "cache" };
        }

        // Fallback DB
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                [Op.or]: [{ requester_id: userId }, { receiver_id: userId }]
            },
            include: [
                { model: User, as: "requester", attributes: ["id"] },
                { model: User, as: "receiver", attributes: ["id"] }
            ],
            order: [["created_at", "DESC"]]
        });

        const friendList = friends.map(f => f.requester_id === userId ? f.receiver : f.requester);

        if (friendList.length > 0) {
            const pipeline = redis.multi();
            pipeline.sAdd(key, ...friendList.map(f => String(f.id)));
            pipeline.expire(key, 60 * 60 * 24 * 7);
            await pipeline.exec();
        }

        return { result: friendList, source: "db" };
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

        // Fallback DB
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                [Op.or]: [{ requester_id: userId }, { receiver_id: userId }]
            },
            include: [
                { model: User, as: "requester", attributes: { exclude: ["password"] } },
                { model: User, as: "receiver", attributes: { exclude: ["password"] } }
            ],
            order: [["created_at", "DESC"]]
        });

        const friendList = friends.map(f => f.requester_id === userId ? f.receiver : f.requester);

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

    // ================== Lấy lời mời kết bạn ==================
    async getFriendRequests(userId) {
        if (!userId) {
            return {
                error: { code: 400, name: "GetFriendRequestsError", message: "User ID is required" }
            };
        }

        const requests = await Friend.findAll({
            where: { receiver_id: userId, status: "pending" },
            include: [{ model: User, as: "requester", attributes: ["id", "username", "email"] }]
        });

        return { result: requests.map(r => r.requester) };
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
        const request = await Friend.findOne({
            where: { requester_id: requesterId, receiver_id: userId, status: "pending" },
            include: [
                { model: User, as: "requester", attributes: { exclude: ["password"] } },
                { model: User, as: "receiver", attributes: { exclude: ["password"] } }
            ]
        });

        if (!request) {
            return { error: { code: 404, name: "FriendError", message: "Friend request not found" } };
        }

        request.status = "accepted";
        await request.save();
        await chatService.creatChat(userId, requesterId);
        await this.updateFriendshipCache(userId, requesterId, "accept");
        return { result: request };
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
