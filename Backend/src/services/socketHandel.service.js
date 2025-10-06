import messageService from "../services/message.service.js";
import redisHelper from "../helpers/redis.helper.js";

export default {
    async joinRoom(socket, io) {
        socket.on("joinChat", async ({ chatId, friendId }) => {
            console.log(`User ${socket.userId} joining chat ${chatId} with friend ${friendId}`);
            await redisHelper.resetUnreadCount(socket.userId, friendId);
            socket.join(chatId.toString());
        });

        socket.on("leaveChat", async ({ chatId, friendId }) => {
            console.log(`User ${socket.userId} leaving chat ${chatId} with friend ${friendId}`);
            socket.leave(chatId.toString());
        });
    },

    async sendMessage(socket, io) {
        socket.on("sendMessage", async ({ receiverId, chatId, text, file, tempId }) => {
            
            const { error, result } = await messageService.sendMessage(
                socket.userId,
                receiverId,
                chatId,
                text,
                file,
                tempId
            );
            
            if (error) {
                console.log("Error sending message:", error);
                return socket.emit("errorMessage", error);
            }
            
            const lastMessage = result.message.content || "image";
            await redisHelper.updateLastMessageCache(socket.userId, receiverId, lastMessage);
            
            io.to(chatId.toString()).emit("newMessage", {
                ...result,
                lastMessage: lastMessage,
            });
            
            const clientsInRoom = await io.in(chatId.toString()).fetchSockets();
            const receiverInRoom = clientsInRoom.some(
                (client) => Number(client.userId) === Number(receiverId)
            );
            
            
            if (receiverInRoom) {
                await redisHelper.resetUnreadCount(receiverId, socket.userId);
            }
            
            const unreadCount = receiverInRoom 
                ? 0 
                : await redisHelper.getUnreadCount(receiverId, socket.userId);
            
            const chatUpdateData = {
                chatId,
                senderId: Number(socket.userId),
                lastMessage,
                unreadCount
            };

            io.to(receiverId.toString()).emit("chatUpdate", chatUpdateData);
        });
    },
};