import { Server } from "socket.io";
import http from "http";
import express from "express";
import redis from "./redisConf.js";
import socketHandelService from "../services/socketHandel.service.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

async function setUserOnline(userId) {
  await redis.sAdd("online_users", userId);
}

async function setUserOffline(userId) {
  await redis.sRem("online_users", userId);
}

async function getUserOnline(userId) {
  const usersOnline = await redis.sMembers("online_users");
  const userFriends = await redis.sMembers(`friends:${userId}`);
  const onlineFriends = usersOnline.filter(id => userFriends.includes(id) && id !== userId.toString());
  console.log("Online friends for user", userId, ":", onlineFriends);
  return onlineFriends;
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined" && userId !== "null") {
    socket.userId = userId;
    await setUserOnline(userId);

    socket.join(userId.toString());
    console.log(`User ${userId} joined personal room: ${userId.toString()}`);

    const friends = await getUserOnline(userId);
    socket.emit("getUserOnline", friends);
    friends.forEach(friendId => {
      io.to(friendId).emit("userOnline", userId);
    });
  }

  socketHandelService.joinRoom(socket, io);
  socketHandelService.sendMessage(socket, io);

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id, "userId:", userId);

    if (userId) {
      await setUserOffline(userId);
      const friends = await getUserOnline(userId);
      friends.forEach(friendId => {
        io.to(friendId).emit("userOffline", { userId });
      });
    }
  });
});

export { io, app, server };