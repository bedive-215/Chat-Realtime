import { createClient } from "redis";
import { REDIS_HOST, REDIS_PORT } from "../helpers/env.helper.js";

const redis = createClient({
  socket: {
    host: REDIS_HOST || "localhost",
    port: REDIS_PORT || 6379,
  },
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

// Tự connect khi module được import
(async () => {
  try {
    await redis.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

export default redis;