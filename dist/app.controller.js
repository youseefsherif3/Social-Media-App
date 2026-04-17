"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const config_service_1 = require("./config/config.service");
const global_error_handling_1 = require("./common/utils/global_error_handling");
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const connectionDB_1 = require("./DB/connectionDB");
const redis_connection_1 = require("./DB/redis/redis.connection");
const app = (0, express_1.default)();
const port = config_service_1.PORT;
const bootstrap = () => {
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this IP, please try again after 15 minutes",
        handler: (req, res, next) => {
            throw new global_error_handling_1.AppError("Too many requests from this IP, please try again after 15 minutes", 429);
        },
        legacyHeaders: false,
    });
    app.use(express_1.default.json());
    app.use(limiter, (0, cors_1.default)(), (0, helmet_1.default)());
    app.get("/", (req, res, next) => {
        res.status(200).json({ message: "Welcome to the Social Media App API" });
    });
    (0, connectionDB_1.connectDB)();
    (0, redis_connection_1.connectRedis)();
    app.use("/auth", auth_controller_1.default);
    app.use("{/*demo}", (req, res, next) => {
        throw new global_error_handling_1.AppError(`Can't find ${req.originalUrl} on this server! , please check the URL and try again.`, 404);
    });
    app.use(global_error_handling_1.globalErrorHandler);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};
exports.default = bootstrap;
