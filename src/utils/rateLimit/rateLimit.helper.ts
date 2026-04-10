import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRateLimitRedisClient } from "../../config/redis.config.js";

const useRedis = process.env.USE_REDIS === 'true';
const useRateLimit = process.env.USE_RATE_LIMIT === 'true';

let enabled = false;

export const initRateLimiters = () => {
  if (!useRedis || !useRateLimit) {
    console.log(`USE_REDIS=${useRedis} USE_RATE_LIMIT=${useRateLimit} - Rate limiting disabled`);
    enabled = false;
    return;
  }
  enabled = true;
};

const getSendCommand = () => {
  let retries = 0;
  const maxRetries = 50;

  return async (...args: string[]) => {
    const rateLimitRedisClient = getRateLimitRedisClient();
    while (rateLimitRedisClient && !rateLimitRedisClient.isOpen && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    if (!rateLimitRedisClient || !rateLimitRedisClient.isOpen) {
      throw new Error("Rate limit Redis not connected");
    }

    return rateLimitRedisClient.sendCommand(args) as Promise<boolean | number | string>;
  };
};

export const aggressiveLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 100,
  message: "Too many requests. Please try again after 2 minutes",
  store: new RedisStore({ sendCommand: getSendCommand(), prefix: "rl-aggressive:" }),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  skip: () => !enabled,
});

export const normalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  message: "Too many requests. Please try again after 60 seconds",
  store: new RedisStore({ sendCommand: getSendCommand(), prefix: "rl-normal:" }),
  ipv6Subnet: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => !enabled,
});