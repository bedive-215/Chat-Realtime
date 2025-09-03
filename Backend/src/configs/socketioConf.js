import { Server } from "socket.io";
import http from "http";
import express from "express";
import redis from "./redisConf.js";
import { getFriends } from "../controllers/friend.controller.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

async function setUserOnline(userId) {
    await redis.sadd('online_users', userId);
    await redis.setex(`online:${userId}`, 60, "1");
}

async function setUserOffline(userId) {
  await redis.srem("online_users", userId);
  await redis.del(`online:${userId}`);
}

async function getUserOnline() {
  const onlineFriends = await redis.sinter(`friends:${userId}`, "online_users");
  return onlineFriends;
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    setUserOnline(userId);
    getUserOnline(userId).then((friends) => {
      socket.emit("getUserOnline", friends);
    });
  }

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    await setUserOffline(userId);

    io.emit("getUserOnline", await getUserOnline(userId));
  });
});


export { io, app, server };