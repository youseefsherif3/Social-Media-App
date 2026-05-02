"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_1 = __importDefault(require("../../common/middleware/authentication"));
const authorization_1 = require("../../common/middleware/authorization");
const user_enum_1 = require("../../common/enum/user.enum");
const userRouter = (0, express_1.Router)();
userRouter.get("/profile", authentication_1.default.authentication, (0, authorization_1.authorization)(user_enum_1.RoleEnum.user), user_service_1.default.getProfile);
userRouter.post("/profile/upload-image", authentication_1.default.authentication, user_service_1.default.uploadProfileImage);
userRouter.get("/profile/image/*path", user_service_1.default.getProfileImage);
exports.default = userRouter;
