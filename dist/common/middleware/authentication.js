"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_handling_1 = require("../utils/global_error_handling");
const token_service_1 = require("../utils/token.service");
const config_service_1 = require("../../config/config.service");
const user_repository_1 = __importDefault(require("../../DB/repositories/user.repository "));
const redis_service_1 = require("../../DB/redis/redis.service");
class AuthenticationMiddleware {
    _userModel = new user_repository_1.default();
    constructor() { }
    authentication = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new global_error_handling_1.AppError("Unauthorized access, please provide a valid token", 401);
        }
        const decoded = (0, token_service_1.verifyToken)({
            token: authorization,
            secret_key: config_service_1.TOKEN_SECRET_KEY,
        });
        if (!decoded || !decoded?.userId) {
            throw new global_error_handling_1.AppError("Unauthorized access, invalid token", 401);
        }
        if (decoded?.jti) {
            const revokedToken = await (0, redis_service_1.getMethod)(`revokedTokens:${decoded.userId}:${decoded.jti}`);
            if (revokedToken) {
                throw new global_error_handling_1.AppError("Unauthorized access, token is revoked", 401);
            }
        }
        const user = await this._userModel.findById(decoded.userId);
        if (!user) {
            throw new global_error_handling_1.AppError("Unauthorized access, user associated with the token not found", 401);
        }
        if (user.changeCredentials.getTime() > decoded.iat * 1000) {
            throw new global_error_handling_1.AppError("Unauthorized access, token is invalid", 401);
        }
        const revokedToken = await (0, redis_service_1.getMethod)(`revokedTokens:${user._id.toString()}:${decoded.jti}`);
        if (revokedToken) {
            throw new global_error_handling_1.AppError("Unauthorized access, token is revoked", 401);
        }
        const request = req;
        request.user = user;
        request.decoded = decoded;
        next();
    };
}
exports.default = new AuthenticationMiddleware();
