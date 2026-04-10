import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";

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

export const aggressiveLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 100,
  message: "Too many requests. Please try again after 2 minutes",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  skip: () => !enabled,
});

export const normalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  message: "Too many requests. Please try again after 60 seconds",
  ipv6Subnet: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => !enabled,
});
