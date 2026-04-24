"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_service_1 = require("../../config/config.service");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: config_service_1.REDIS_URL,
        });
        this.handleError();
    }
    async connect() {
        this.client.connect();
        console.log("Connection To Redis Successfully ");
    }
    handleError() {
        this.client.on("error", (err) => {
            console.error("Redis Client Error", err);
        });
    }
    max_OTP_Key = (email) => {
        return `max_otp::${email}`;
    };
    block_OTP_Key = (email) => {
        return `block_otp::${email}`;
    };
    setMethod = async ({ key, value, ttl, }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl
                ? await this.client.set(key, data, { EX: ttl })
                : await this.client.set(key, data);
        }
        catch (error) {
            console.error("Error setting value in Redis:", error);
        }
    };
    getMethod = async (key) => {
        try {
            try {
                return JSON.parse((await this.client.get(key)));
            }
            catch (error) {
                return await this.client.get(key);
            }
        }
        catch (error) {
            console.error("Error getting value from Redis:", error);
        }
    };
    deleteMethod = async (key) => {
        try {
            return await this.client.del(key);
        }
        catch (error) {
            console.error("Error deleting value from Redis:", error);
        }
    };
    checkTTLMethod = async (key) => {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.error("Error checking TTL of key in Redis:", error);
        }
    };
    keys = async (patterns) => {
        try {
            return await this.client.keys(`${patterns}*`);
        }
        catch (error) {
            console.error("Error fetching keys from Redis:", error);
        }
    };
    flushAll = async () => {
        try {
            return await this.client.flushAll();
        }
        catch (error) {
            console.error("Error flushing all keys from Redis:", error);
        }
    };
    disconnect = async () => {
        try {
            await this.client.quit();
            console.log("Disconnected from Redis successfully");
        }
        catch (error) {
            console.error("Error disconnecting from Redis:", error);
        }
    };
    incrMethod = async (key) => {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.error("Error incrementing value in Redis:", error);
        }
    };
    OTP_Key = (email) => {
        return `emailVerification:${email}`;
    };
}
exports.default = new RedisService();
