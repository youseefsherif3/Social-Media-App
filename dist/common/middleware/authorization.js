"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const global_error_handling_1 = require("../utils/global_error_handling");
const authorization = (requiredRole) => {
    return (req, res, next) => {
        const request = req;
        if (!requiredRole.includes(request.user.role)) {
            throw new global_error_handling_1.AppError("Forbidden access, you don't have permission to access this resource", 403);
        }
        next();
    };
};
exports.authorization = authorization;
