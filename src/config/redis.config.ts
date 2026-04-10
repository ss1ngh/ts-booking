import { createClient } from "redis";

const useRedis = process.env.USE_REDIS === 'true';

let redisClient: ReturnType<typeof createClient> | null = null;
let rateLimitRedisClient: ReturnType<typeof createClient> | null = null;

if (useRedis) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  rateLimitRedisClient = createClient({
    url: process.env.REDIS_URL?.replace(/\/$/, "") + "/1",
  });
}

export const connectRedis = async () => {
  if (!useRedis) {
    console.log("USE_REDIS=false - Skipping Redis connection");
    return;
  }
  if (redisClient && !redisClient.isOpen) {
    await redisClient.connect();
    console.log("Connected to Redis");
  }
};

export const connectRateLimitRedis = async () => {
  if (!useRedis) {
    console.log("USE_REDIS=false - Skipping Rate Limit Redis connection");
    return;
  }
  if (rateLimitRedisClient && !rateLimitRedisClient.isOpen) {
    await rateLimitRedisClient.connect();
    console.log("Connected to Rate Limit Redis (DB 1)");
  }
};

export const getRateLimitRedisClient = () => rateLimitRedisClient;
export const getRedisClient = () => redisClient;
export default redisClient;
