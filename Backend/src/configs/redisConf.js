import { createClient } from "redis";

import { REDIS_URL } from "../helpers/env.helper.js";

const redis = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redis.on("connect", () => {
  console.log("Redis connecting...");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

(async () => {
  try {
    await redis.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default redis;