//* Importing necessary modules and initializing the Redis client
import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service";

//* RedisService class to handle interactions with the Redis server
class RedisService {
  private readonly client;

  //* Constructor to initialize the Redis client with the provided Redis URL from the configuration
  constructor() {
    this.client = createClient({
      url: REDIS_URL!,
    });
    this.handleError();
  }

  //* Method to connect to the Redis server and log a success message upon successful connection
  async connect() {
    this.client.connect();
    console.log("Connection To Redis Successfully ");
  }

  //* Method to handle errors emitted by the Redis client and log them to the console
  handleError() {
    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  }

  max_OTP_Key = (email: string) => {
    return `max_otp::${email}`;
  };

  block_OTP_Key = (email: string) => {
    return `block_otp::${email}`;
  };

  //* The Set Method Function To set a value in Redis with an optional TTL
  setMethod = async ({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: string | object;
    ttl?: number;
  }) => {
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);

      return ttl
        ? await this.client.set(key, data, { EX: ttl })
        : await this.client.set(key, data);
    } catch (error) {
      console.error("Error setting value in Redis:", error);
    }
  };

  //* The Get Method Function To get a value from Redis
  getMethod = async (key: string) => {
    try {
      try {
        return JSON.parse((await this.client.get(key)) as string);
      } catch (error) {
        return await this.client.get(key);
      }
    } catch (error) {
      console.error("Error getting value from Redis:", error);
    }
  };

  //* The Delete Method Function To delete a value from Redis
  deleteMethod = async (key: any) => {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("Error deleting value from Redis:", error);
    }
  };

  //* The Check TTL Method Function To check the TTL of a key in Redis
  checkTTLMethod = async (key: string) => {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Error checking TTL of key in Redis:", error);
    }
  };

  //* The Keys Method Function To get all keys matching a pattern from Redis
  keys = async (patterns: string) => {
    try {
      return await this.client.keys(`${patterns}*`);
    } catch (error) {
      console.error("Error fetching keys from Redis:", error);
    }
  };

  //* The Flush All Method Function To flush all keys from Redis
  flushAll = async () => {
    try {
      return await this.client.flushAll();
    } catch (error) {
      console.error("Error flushing all keys from Redis:", error);
    }
  };

  //* The Disconnect Method Function To disconnect from the Redis server
  disconnect = async () => {
    try {
      await this.client.quit();
      console.log("Disconnected from Redis successfully");
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
    }
  };

  //* The Increment Method Function To increment a value in Redis
  incrMethod = async (key: string) => {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error("Error incrementing value in Redis:", error);
    }
  };

  OTP_Key = (email: string) => {
    return `emailVerification:${email}`;
  };
}

export default new RedisService();
