import { createClient } from "redis";
import { REDIS_HOST } from "../helpers/env.helper.js";

export const redis = createClient({
    socket: {
        host: 'localhost' || REDIS_HOST,
        port: 6379
    }
});

redis.on('error', error => console.error("Redis error: ", error));