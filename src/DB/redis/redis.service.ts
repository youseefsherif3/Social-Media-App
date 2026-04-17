import { redisClient } from "./redis.connection";

//* The Set Method Function To set a value in Redis
export const setMethod = async ({ key, value, ttl } : {key : string, value: unknown, ttl?: number }) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);

    return ttl
      ? await redisClient.set(key, data, { EX: ttl })
      : await redisClient.set(key, data);
  } catch (error) {
    console.error("Error setting value in Redis:", error);
  }
};

//* The Get Method Function To get a value from Redis
export const getMethod = async (key : string) => {
  try {
    try {
      return JSON.parse(await redisClient.get(key) as string);
    } catch (error) {
      return await redisClient.get(key);
    }
  } catch (error) {
    console.error("Error getting value from Redis:", error);
  }
};

//* The Delete Method Function To delete a value from Redis
export const deleteMethod = async (key : any) => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error("Error deleting value from Redis:", error);
  }
};

//* The Check TTL Method Function To check the TTL of a key in Redis
export const checkTTLMethod = async (key : string) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Error checking TTL of key in Redis:", error);
  }
};

//* The Keys Method Function To get all keys matching a pattern from Redis
export const keys = async (patterns : string) => {
  try {
    return await redisClient.keys(`${patterns}*`);
  } catch (error) {
    console.error("Error fetching keys from Redis:", error);
  }
};

//* The Flush All Method Function To flush all keys from Redis
export const flushAll = async () => {
  try {
    return await redisClient.flushAll();
  } catch (error) {
    console.error("Error flushing all keys from Redis:", error);
  }
};

//* The Disconnect Method Function To disconnect from the Redis server
export const disconnect = async () => {
  try {
    await redisClient.quit();
    console.log("Disconnected from Redis successfully");
  } catch (error) {
    console.error("Error disconnecting from Redis:", error);
  }
};

//* The Increment Method Function To increment a value in Redis
export const incrMethod = async (key : string) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.error("Error incrementing value in Redis:", error);
  }
};

export const OTP_Key = (email: string) => {
    return `emailVerification:${email}`;
}