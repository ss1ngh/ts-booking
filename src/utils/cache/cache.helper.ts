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
