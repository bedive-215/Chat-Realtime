import messageService from "../services/message.service.js";
import redisHelper from "../helpers/redis.helper.js";

export default {
    async joinRoom(socket, io) {
        socket.on("joinChat", async ({ chatId, friendId }) => {
            socket.join(chatId.toString());
            await redisHelper.resetUnreadCount(socket.userId, friendId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });
    },
    async sendMessage(socket, io) {
        socket.on("sendMessage", async ({ receiverId, chatId, text, file, tempId }) => {
            const { error, result} = await messageService.sendMessage(
                socket.userId,
                receiverId,
                chatId,
                text,
                file,
                tempId
            );
            if (error) {
                return socket.emit("errorMessage", error);
            }

            io.to(chatId.toString()).emit("newMessage", result);

            const lastMessage = text || "image";

            const clientsInRoom = await io.in(chatId.toString()).fetchSockets();
            const receiverInRoom = clientsInRoom.some(client => client.userId === receiverId);

            if (receiverInRoom) {
                await redisHelper.resetUnreadCount(receiverId, socket.userId);
                io.to(receiverId.toString()).emit("resetUnread", { friendId: socket.userId });
            } else {
                await redisHelper.updateLastMessageCache(socket.userId, receiverId, lastMessage);
                io.to(receiverId.toString()).emit("friendUpdate", {
                    chatId,
                    senderId: socket.userId,
                    lastMessage,
                    unreadCount: await redisHelper.getUnreadCount(receiverId, socket.userId),
                });
            }
        });
    }
};
