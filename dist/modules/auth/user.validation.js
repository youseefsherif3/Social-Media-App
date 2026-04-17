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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.updatePasswordSchema = exports.loginSchema = exports.confirmEmailSchema = exports.signUpSchema = void 0;
const user_enum_1 = require("../../common/enum/user.enum");
const z = __importStar(require("zod"));
exports.signUpSchema = {
    body: z
        .object({
        userName: z.string().min(3).max(25),
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
        age: z.number().min(13).max(60),
        gender: z.enum(user_enum_1.GenderEnum).optional(),
        address: z.string().min(3).max(100).optional(),
        phone: z.string().min(10).max(15).optional(),
    })
        .refine((date) => {
        return date.password === date.confirmPassword;
    }, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
exports.confirmEmailSchema = {
    body: z.object({
        email: z.string().email(),
        OTP: z.string().length(6),
    }),
};
exports.loginSchema = {
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
};
exports.updatePasswordSchema = {
    body: z
        .object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
        confirmNewPassword: z.string().min(6),
    })
        .refine((data) => {
        return data.newPassword === data.confirmNewPassword;
    }, {
        message: "New passwords do not match",
        path: ["confirmNewPassword"],
    }),
};
exports.resetPasswordSchema = {
    body: z
        .object({
        email: z.string().email(),
        OTP: z.string().length(6),
        newPassword: z.string().min(6),
        confirmNewPassword: z.string().min(6),
    })
        .refine((data) => {
        return data.newPassword === data.confirmNewPassword;
    }, {
        message: "New passwords do not match",
        path: ["confirmNewPassword"],
    }),
};
