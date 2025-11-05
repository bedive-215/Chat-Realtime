import Notification from "../models/notifications.model.js";

export default {
    async createNotification(senderId, receiverId, type, content) {
        try {
            if (!senderId || !receiverId || !type) {
                return {
                    error: {
                        code: 400,
                        name: "CreateNotificationError",
                        message: "Sender ID, Receiver ID, and Type are required",
                    },
                };
            }
            const newNotification = await Notification.create({
                senderId,
                receiverId,
                type,
                content
            });
            return {
                result: {
                    name: "NotificationCreated",
                    message: "Notification created successfully",
                    notification: newNotification,
                },
            };
        } catch (error) {
            console.error("Error createNotification:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while creating notification",
                },
            };
        }
    },
    async markAsRead(id) {
        try {
            if (!id) {
                return {
                    error: {
                        code: 400,
                        name: "MarkAsReadError",
                        message: "Notification ID is required",
                    },
                };
            }
            const notification = await Notification.findOne({ _id: id });
            if (!notification) {
                return {
                    error: {
                        code: 404,
                        name: "NotificationNotFound",
                        message: "Notification not found",
                    },
                };
            }
            notification.isRead = true;
            await notification.save();
            return {
                result: {
                    name: "NotificationMarkedAsRead",
                    message: "Notification marked as read successfully",
                },
            };
        } catch (error) {
            console.error("Error markAsRead:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while marking notification as read",
                },
            };
        }
    },
    async getNotifications(receiverId, onlyUnread = false) {
        try {
            if (!receiverId) {
                return {
                    error: {
                        code: 400,
                        name: "GetNotificationsError",
                        message: "Receiver ID is required",
                    },
                };
            }
            const query = { receiverId };
            if (onlyUnread) {
                query.isRead = false;
            }
            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .lean();
            return {
                result: {
                    name: "NotificationsFetched",
                    message: "Notifications retrieved successfully",
                    notifications,
                },
            };
        } catch (error) {
            console.error("Error getNotifications:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while fetching notifications",
                },
            };
        }
    },
    async deleteNotification(id) {
        try {
            if (!id) {
                return {
                    error: {
                        code: 400,
                        name: "DeleteNotificationError",
                        message: "Notification ID is required",
                    },
                };
            }

            const result = await Notification.deleteOne({ _id: id });

            if (result.deletedCount === 0) {
                return {
                    error: {
                        code: 404,
                        name: "DeleteNotificationError",
                        message: `No notification found with id ${id}`,
                    },
                };
            }

            return {
                result: {
                    name: "DeleteNotificationSuccess",
                    message: `Deleted notification with id ${id} successfully.`,
                },
            };
        } catch (error) {
            console.error("Error while deleting notification:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while deleting notification.",
                },
            };
        }
    }
}