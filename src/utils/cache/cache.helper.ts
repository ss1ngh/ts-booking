import redisClient from "../../config/redis.config";

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Redis GET error for key [${key}] : `, error);
    return null;
  }
};

export const setCache = async (
  key: string,
  data: any,
  ttlSeconds: number = 3600,
): Promise<void> => {
  try {
    const stringifiedData = JSON.stringify(data);

    await redisClient.set(key, stringifiedData, {
      expiration: { type: "EX", value: ttlSeconds },
    });
  } catch (error) {
    console.error(`Redis SET error for key [${key}]  :`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key [${key}] : `, error);
  }
};

export const acquireLock = async (
  resource: string,
  ttlMs: number = 5000,
): Promise<boolean> => {
  const lockKey = `lock:${resource}`;

  try {
    const result = await redisClient.set(lockKey, "true", {
      NX: true,
      PX: ttlMs,
    });

    return result === "OK";
  } catch (error) {
    console.error(`Redis LOCK error for key [${lockKey}] : `, error);
    return false;
  }
};

export const releaseLock = async (resource: string): Promise<void> => {
  const lockKey = `lock:${resource}`;
  try {
    await redisClient.del(lockKey);
  } catch (error) {
    console.error(`Redis UNLOCK error for key [${lockKey}] : `, error);
  }
};
