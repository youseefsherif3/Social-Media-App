//* Importing nessary types and modules for connecting to Redis
import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service";

//* Creating a Redis client using the createClient function from the redis library and passing the Redis URL from the configuration 
export const redisClient = createClient({
  url: REDIS_URL,
});

//* Asynchronous function to connect to the Redis server, handling success and error cases 
export const connectRedis = async () => {
  await redisClient
    .connect()
    .then(() => {
      console.log("Connected to Redis successfully");
    })
    .catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });
};
