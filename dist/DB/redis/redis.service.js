"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_Key = exports.incrMethod = exports.disconnect = exports.flushAll = exports.keys = exports.checkTTLMethod = exports.deleteMethod = exports.getMethod = exports.setMethod = void 0;
const redis_connection_1 = require("./redis.connection");
const setMethod = async ({ key, value, ttl }) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl
            ? await redis_connection_1.redisClient.set(key, data, { EX: ttl })
            : await redis_connection_1.redisClient.set(key, data);
    }
    catch (error) {
        console.error("Error setting value in Redis:", error);
    }
};
exports.setMethod = setMethod;
const getMethod = async (key) => {
    try {
        try {
            return JSON.parse(await redis_connection_1.redisClient.get(key));
        }
        catch (error) {
            return await redis_connection_1.redisClient.get(key);
        }
    }
    catch (error) {
        console.error("Error getting value from Redis:", error);
    }
};
exports.getMethod = getMethod;
const deleteMethod = async (key) => {
    try {
        return await redis_connection_1.redisClient.del(key);
    }
    catch (error) {
        console.error("Error deleting value from Redis:", error);
    }
};
exports.deleteMethod = deleteMethod;
const checkTTLMethod = async (key) => {
    try {
        return await redis_connection_1.redisClient.ttl(key);
    }
    catch (error) {
        console.error("Error checking TTL of key in Redis:", error);
    }
};
exports.checkTTLMethod = checkTTLMethod;
const keys = async (patterns) => {
    try {
        return await redis_connection_1.redisClient.keys(`${patterns}*`);
    }
    catch (error) {
        console.error("Error fetching keys from Redis:", error);
    }
};
exports.keys = keys;
const flushAll = async () => {
    try {
        return await redis_connection_1.redisClient.flushAll();
    }
    catch (error) {
        console.error("Error flushing all keys from Redis:", error);
    }
};
exports.flushAll = flushAll;
const disconnect = async () => {
    try {
        await redis_connection_1.redisClient.quit();
        console.log("Disconnected from Redis successfully");
    }
    catch (error) {
        console.error("Error disconnecting from Redis:", error);
    }
};
exports.disconnect = disconnect;
const incrMethod = async (key) => {
    try {
        return await redis_connection_1.redisClient.incr(key);
    }
    catch (error) {
        console.error("Error incrementing value in Redis:", error);
    }
};
exports.incrMethod = incrMethod;
const OTP_Key = (email) => {
    return `emailVerification:${email}`;
};
exports.OTP_Key = OTP_Key;
