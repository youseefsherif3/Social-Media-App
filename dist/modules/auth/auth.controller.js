"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const validation_1 = require("../../common/middleware/validation");
const userValidation = __importStar(require("./user.validation"));
const authentication_1 = __importDefault(require("../../common/middleware/authentication"));
const authorization_1 = require("../../common/middleware/authorization");
const user_enum_1 = require("../../common/enum/user.enum");
const authRouter = (0, express_1.Router)();
authRouter.post("/signUp", (0, validation_1.validation)(userValidation.signUpSchema), auth_service_1.default.signUp);
authRouter.post("/signUp/google", auth_service_1.default.signUpWithGoogle);
authRouter.patch("/confirm-email", (0, validation_1.validation)(userValidation.confirmEmailSchema), auth_service_1.default.confirmEmail);
authRouter.patch("/resend-otp", (0, validation_1.validation)(userValidation.resendOTPSchema), auth_service_1.default.resendOTP);
authRouter.post("/login", (0, validation_1.validation)(userValidation.loginSchema), auth_service_1.default.login);
authRouter.get("/profile", authentication_1.default.authentication, (0, authorization_1.authorization)(user_enum_1.RoleEnum.user), auth_service_1.default.getProfile);
authRouter.get("/refresh-token", auth_service_1.default.refreshToken);
authRouter.patch("/update-password", authentication_1.default.authentication, (0, validation_1.validation)(userValidation.updatePasswordSchema), auth_service_1.default.updatePassword);
authRouter.post("/forgot-password", auth_service_1.default.forgotPassword);
authRouter.post("/reset-password", (0, validation_1.validation)(userValidation.resetPasswordSchema), auth_service_1.default.resetPassword);
authRouter.post("/logout", authentication_1.default.authentication, auth_service_1.default.logout);
exports.default = authRouter;
