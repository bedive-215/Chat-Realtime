import models from "../models";
import { Op } from "sequelize";

const { User, Friend } = models;

export default {
    async getFriends(userId) {
        if (!userId) {
            return {
                error: {
                    code: 400,
                    name: "GetFriendsError",
                    message: "User ID is required"
                }
            };
        }

        const key = `friends:${userId}`;

        // Ưu tiên lấy từ cache
        const friendIds = await redis.sMembers(key);

        if (friendIds.length > 0) {
            return { result: friendIds.map(id => ({ id })) };
        }

        // Nếu không có trong cache -> fallback DB
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                [Op.or]: [
                    { requester_id: userId },
                    { receiver_id: userId }
                ]
            },
            include: [
                { model: User, as: "requester", attributes: ["id", "username"] },
                { model: User, as: "receiver", attributes: ["id", "username"] }
            ]
        });

        const friendList = friends.map(f => {
            return f.requester_id === userId ? f.receiver : f.requester;
        });

        // Cập nhật lại cache
        if (friendList.length > 0) {
            const pipeline = redis.multi();
            pipeline.sAdd(key, ...friendList.map(f => f.id));
            pipeline.expire(key, 60 * 60 * 24 * 3);
            await pipeline.exec();
        }

        return { result: friendList };
    },

    async getFriendRequests(userId) {
        if (!userId) {
            return {
                error: {
                    code: 400,
                    name: "GetFriendRequestsError",
                    message: "User ID is required"
                }
            };
        }

        const requests = await Friend.findAll({
            where: {
                receiver_id: userId,
                status: "pending"
            },
            include: [
                {
                    model: User,
                    as: "requester",
                    attributes: ["id", "username", "email"]
                }
            ]
        });

        // Map chỉ lấy người gửi (requester)
        const requestList = requests.map(r => r.requester);

        return {
            result: requestList
        };
    },

    async sendFriendRequest(userId, friendId) {
        if (!userId || !friendId) {
            return {
                error: { code: 400, name: "FriendError", message: "User ID and Friend ID are required" }
            };
        }

        if (userId === friendId) {
            return {
                error: { code: 400, name: "FriendError", message: "You cannot add yourself" }
            };
        }

        // Kiểm tra xem đã có quan hệ bạn bè chưa
        const existing = await Friend.findOne({
            where: {
                [Op.or]: [
                    { requester_id: userId, receiver_id: friendId },
                    { requester_id: friendId, receiver_id: userId }
                ]
            }
        });

        if (existing) {
            if (existing.status === "pending") {
                return { error: { code: 400, message: "Friend request already sent" } };
            }
            if (existing.status === "accepted") {
                return { error: { code: 400, message: "Already friends" } };
            }
        }

        const request = await Friend.create({
            requester_id: userId,
            receiver_id: friendId,
            status: "pending"
        });

        return { result: request };
    },

    // Chấp nhận lời mời kết bạn
    async acceptFriendRequest(userId, requesterId) {
        const request = await Friend.findOne({
            where: {
                requester_id: requesterId,
                receiver_id: userId,
                status: "pending"
            }
        });

        if (!request) {
            return {
                error: { code: 404, name: "FriendError", message: "Friend request not found" }
            };
        }

        request.status = "accepted";
        await request.save();

        // Cập nhật cache cho cả 2 phía
        const keys = [`friends:${userId}`, `friends:${requesterId}`];

        for (const key of keys) {
            const exists = await redis.exists(key);
            if (exists) {
                await redis.sAdd(key, key === `friends:${userId}` ? requesterId : userId);
                await redis.expire(key, 60 * 60 * 24 * 3); // reset TTL
            } else {
                // Cache chưa tồn tại thì rebuild từ DB
                await this.getFriends(key.split(":")[1]);
            }
        }

        return { result: request };
    },

    // Từ chối lời mời
    async rejectFriendRequest(userId, requesterId) {
        const request = await Friend.findOne({
            where: {
                requester_id: requesterId,
                receiver_id: userId,
                status: "pending"
            }
        });

        if (!request) {
            return {
                error: { code: 404, name: "FriendError", message: "Friend request not found" }
            };
        }

        await request.destroy();

        return { result: { message: "Friend request rejected" } };
    },
    async cancelFriendRequest(userId, friendId) {
        const request = await Friend.findOne({
            where: {
                requester_id: userId,
                receiver_id: friendId,
                status: "pending"
            }
        });

        if (!request) {
            return {
                error: { code: 404, name: "FriendError", message: "Friend request not found or already handled" }
            };
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
            return {
                error: { code: 404, name: "FriendError", message: "Friendship not found" }
            };
        }

        await friendship.destroy();

        const keys = [`friends:${userId}`, `friends:${friendId}`];

        for (const key of keys) {
            const exists = await redis.exists(key);
            if (exists) {
                await redis.sRem(key, key === `friends:${userId}` ? friendId : userId);
                await redis.expire(key, 60 * 60 * 24 * 3); // reset TTL
            } else {
                await this.getFriends(key.split(":")[1]);
            }
        }

        return { result: { message: "Unfriended successfully" } };
    }

};
