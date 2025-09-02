import { Server } from "socket.io";
import http from "http";
import express from "express";
import redis from "./redisConf.js";

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
    
}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId) setUserOnline(userId);

    io.emit()
})

export { io, app, server };