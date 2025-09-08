import { Server } from "socket.io";
import http from "http";
import express from "express";
import redis from "./redisConf.js";
import messageService from "../services/message.service.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

async function setUserOnline(userId) {
  await redis.sadd('online_users', userId);
}

async function setUserOffline(userId) {
  await redis.srem("online_users", userId);
}

async function getUserOnline() {
  const onlineFriends = await redis.sinter(`friends:${userId}`, "online_users");
  return onlineFriends;
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    await setUserOnline(userId);
    await getUserOnline(userId).then((friends) => {
      socket.emit("getUserOnline", friends);
    });
  }

  socket.on("sendMessage", async ({ chatId, text, file }) => {
    const { error, result } = await messageService.sendMessage(userId, chatId, text, file);
    if (error) {
      return socket.emit("errorMessage", error);
    }
    io.to(chatId.toString()).emit("newMessage", result);
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId.toString());
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    await setUserOffline(userId);

    const friends = await getUserOnline(userId);
    socket.emit("getUserOnline", friends);
  });
});

export { io, app, server };