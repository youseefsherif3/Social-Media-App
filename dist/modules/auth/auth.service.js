"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_handling_1 = require("../../common/utils/global_error_handling");
const user_repository_1 = __importDefault(require("../../DB/repositories/user.repository "));
const encrypt_security_1 = require("../../common/utils/security/encrypt.security");
const hashing_security_1 = require("../../common/utils/security/hashing.security");
const send_email_1 = require("../../common/utils/email/send.email");
const email_template_1 = require("../../common/utils/email/email.template");
const user_enum_1 = require("../../common/enum/user.enum");
const config_service_1 = require("../../config/config.service");
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = require("crypto");
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const email_events_1 = require("../../common/utils/email/email.events");
const token_service_1 = __importDefault(require("../../common/utils/token.service"));
class AuthService {
    _userModel = new user_repository_1.default();
    _redisService = redis_service_1.default;
    _tokenService = token_service_1.default;
    constructor() { }
    sendEmailOtp = async ({ email, userName, }) => {
        const isBlocked = await this._redisService.checkTTLMethod(this._redisService.block_OTP_Key(email));
        if (isBlocked && isBlocked > 0) {
            throw new global_error_handling_1.AppError("Too many OTP requests, please try again later", 429);
        }
        const ttlOtp = await this._redisService.checkTTLMethod(this._redisService.OTP_Key(email));
        if (ttlOtp && ttlOtp > 0) {
            throw new global_error_handling_1.AppError("OTP already sent, please check your email or request a new OTP after some time", 429);
        }
        if ((await this._redisService.getMethod(this._redisService.OTP_Key(email))) >=
            3) {
            await this._redisService.setMethod({
                key: this._redisService.block_OTP_Key(email),
                value: "1",
                ttl: 60 * 60,
            });
            throw new global_error_handling_1.AppError("Too many OTP requests, please try again later", 429);
        }
        const OTP = await (0, send_email_1.generateOTP)();
        email_events_1.Eventemitter.emit(user_enum_1.EmailEnum.verification, async () => {
            await (0, send_email_1.sendEmail)({
                to: email,
                subject: "Verify Your Email for Social Connect",
                html: (0, email_template_1.emailTemplate)(OTP, userName),
            });
            await this._redisService.setMethod({
                key: this._redisService.OTP_Key(email),
                value: (0, hashing_security_1.HashPassword)({ plainText: OTP.toString() }),
                ttl: 10 * 60,
            });
            await this._redisService.incrMethod(this._redisService.max_OTP_Key(email));
        });
    };
    signUp = async (req, res, next) => {
        let { userName, email, password, confirmPassword, age, gender, address, phone, } = req.body;
        const existingUser = await this._userModel.findOne({ filter: { email } });
        if (existingUser) {
            throw new global_error_handling_1.AppError("Email already in use, please use a different email", 409);
        }
        const newUser = await this._userModel.create({
            userName,
            email,
            password: (0, hashing_security_1.HashPassword)({ plainText: password }),
            age,
            gender,
            address,
            phone: phone ? (0, encrypt_security_1.EncryptData)(phone) : null,
            changeCredentials: new Date(),
        });
        const OTP = await (0, send_email_1.generateOTP)();
        email_events_1.Eventemitter.emit(user_enum_1.EmailEnum.verification, async () => {
            await (0, send_email_1.sendEmail)({
                to: email,
                subject: "Verify Your Email for Social Connect",
                html: (0, email_template_1.emailTemplate)(OTP, userName),
            });
            await this._redisService.setMethod({
                key: this._redisService.OTP_Key(email),
                value: (0, hashing_security_1.HashPassword)({ plainText: OTP.toString() }),
                ttl: 10 * 60,
            });
        });
        res
            .status(201)
            .json({ message: "User signed up successfully", user: newUser });
    };
    signUpWithGoogle = async (req, res, next) => {
        const { idToken } = req.body;
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, email_verified, name, } = payload;
        let user = await this._userModel.findOne({
            filter: { email },
        });
        if (!user) {
            user = await this._userModel.create({
                email,
                userName: name,
                confirmed: email_verified,
                provider: user_enum_1.ProviderEnum.google,
            });
        }
        if (user.provider == user_enum_1.ProviderEnum.local) {
            throw new global_error_handling_1.AppError("Email already in use, please use a different email or log in with your credentials", 409);
        }
        const jwtid = (0, crypto_1.randomUUID)();
        const token = this._tokenService.generateToken({
            payload: { userId: user._id, email: user.email },
            secret_key: config_service_1.TOKEN_SECRET_KEY,
            options: { expiresIn: "1h", jwtid },
        });
        res
            .status(200)
            .json({ message: "Login with Google account successful", token });
    };
    confirmEmail = async (req, res, next) => {
        let { email, OTP } = req.body;
        const OTPExists = await this._redisService.getMethod(this._redisService.OTP_Key(email));
        if (!OTPExists) {
            throw new global_error_handling_1.AppError("OTP has expired, please request a new one", 400);
        }
        if (!(0, hashing_security_1.ComparePassword)({ plainText: OTP.toString(), cipherText: OTPExists })) {
            throw new global_error_handling_1.AppError("Invalid OTP, please check the OTP and try again", 400);
        }
        const user = await this._userModel.findOneAndUpdate({
            filter: { email },
            update: { confirmed: true },
        });
        if (!user) {
            throw new global_error_handling_1.AppError("User not found, please check the email and try again", 404);
        }
        await this._redisService.deleteMethod(this._redisService.OTP_Key(email));
        res.status(200).json({ message: "Email confirmed successfully" });
    };
    resendOTP = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmed: false,
                provider: user_enum_1.ProviderEnum.local,
            },
        });
        if (!user) {
            throw new global_error_handling_1.AppError("User not found or already confirmed, please check the email and try again", 404);
        }
        await this.sendEmailOtp({ email, userName: user.userName });
        res.status(200).json({
            message: "OTP resent successfully, please check your email",
        });
    };
    login = async (req, res, next) => {
        let { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: { email, confirmed: true, provider: user_enum_1.ProviderEnum.local, paranoid: true },
        });
        if (!user) {
            throw new global_error_handling_1.AppError("Invalid email or password, please check your credentials and try again", 401);
        }
        if (user.confirmed === false) {
            throw new global_error_handling_1.AppError("Email not confirmed, please confirm your email before logging in", 401);
        }
        if (!(0, hashing_security_1.ComparePassword)({ plainText: password, cipherText: user.password })) {
            throw new global_error_handling_1.AppError("Invalid email or password, please check your credentials and try again", 401);
        }
        const jwtid = (0, crypto_1.randomUUID)();
        const token = this._tokenService.generateToken({
            payload: { userId: user._id, email: user.email },
            secret_key: config_service_1.TOKEN_SECRET_KEY,
            options: { expiresIn: "1h", jwtid },
        });
        const refreshToken = this._tokenService.generateToken({
            payload: { userId: user._id, email: user.email },
            secret_key: config_service_1.REFRESH_TOKEN_SECRET_KEY,
            options: { expiresIn: "1y", jwtid },
        });
        res.status(200).json({ message: "Login successful", token, refreshToken });
    };
    refreshToken = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new global_error_handling_1.AppError("Unauthorized access, please provide a valid refresh token", 401);
        }
        const decoded = this._tokenService.verifyToken({
            token: authorization,
            secret_key: config_service_1.REFRESH_TOKEN_SECRET_KEY,
        });
        if (!decoded || !decoded?.userId) {
            throw new global_error_handling_1.AppError("Unauthorized access, invalid token", 401);
        }
        const user = await this._userModel.findById(decoded.userId);
        if (!user) {
            throw new global_error_handling_1.AppError("Unauthorized access, user associated with the token not found", 401);
        }
        const jwtid = (0, crypto_1.randomUUID)();
        const token = this._tokenService.generateToken({
            payload: { userId: user._id, email: user.email },
            secret_key: config_service_1.TOKEN_SECRET_KEY,
            options: { expiresIn: "1h", jwtid },
        });
        res.status(200).json({ message: "Token refreshed successfully", token });
    };
    updatePassword = async (req, res, next) => {
        let { currentPassword, newPassword } = req.body;
        const request = req;
        if (!(0, hashing_security_1.ComparePassword)({
            plainText: currentPassword,
            cipherText: request.user.password,
        })) {
            throw new global_error_handling_1.AppError("Invalid current password, please check your password and try again", 401);
        }
        const hashedNewPassword = (0, hashing_security_1.HashPassword)({ plainText: newPassword });
        request.user.password = hashedNewPassword;
        await request.user.save();
        res.status(200).json({ message: "Password updated successfully" });
    };
    forgotPassword = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({
            filter: { email, confirmed: true, provider: user_enum_1.ProviderEnum.local, paranoid: true },
        });
        if (!user) {
            throw new global_error_handling_1.AppError("User Not Found, please check the email and try again", 404);
        }
        const OTP = await (0, send_email_1.generateOTP)();
        await (0, send_email_1.sendEmail)({
            to: email,
            subject: "Reset Your Password for Social Connect",
            html: (0, email_template_1.emailTemplate)(OTP, user.userName),
        });
        await this._redisService.setMethod({
            key: this._redisService.OTP_Key(email),
            value: (0, hashing_security_1.HashPassword)({ plainText: OTP.toString() }),
            ttl: 10 * 60,
        });
        res.status(200).json({
            message: "Password reset OTP sent to your email successfully",
        });
    };
    resetPassword = async (req, res, next) => {
        let { email, OTP, newPassword } = req.body;
        const user = await this._userModel.findOne({
            filter: { email, confirmed: true, provider: user_enum_1.ProviderEnum.local, paranoid: true },
        });
        if (!user) {
            throw new global_error_handling_1.AppError("User Not Found, please check the email and try again", 404);
        }
        const OTPExists = await this._redisService.getMethod(this._redisService.OTP_Key(email));
        if (!OTPExists) {
            throw new global_error_handling_1.AppError("OTP has expired, please request a new one", 400);
        }
        if (!(0, hashing_security_1.ComparePassword)({ plainText: OTP.toString(), cipherText: OTPExists })) {
            throw new global_error_handling_1.AppError("Invalid OTP, please check the OTP and try again", 400);
        }
        await this._userModel.findOneAndUpdate({
            filter: { email },
            update: { password: (0, hashing_security_1.HashPassword)({ plainText: newPassword }) },
        });
        await this._redisService.deleteMethod(this._redisService.OTP_Key(email));
        res.status(200).json({ message: "Password reset successfully" });
    };
    logout = async (req, res, next) => {
        const request = req;
        const { flag } = req.query;
        if (flag === user_enum_1.FlagEnum.allDevices) {
            request.user.changeCredentials = new Date();
            await request.user.save();
            await this._redisService.deleteMethod(await this._redisService.keys(`revokedTokens:${request.user._id.toString()}`));
        }
        else {
            await this._redisService.setMethod({
                key: `revokedTokens:${request.user._id.toString()}:${request.decoded.jti}`,
                value: `${request.decoded.jti}`,
                ttl: Math.max(request.decoded.exp - Math.floor(Date.now() / 1000), 1),
            });
        }
        res.status(200).json({ message: "Logged out successfully" });
    };
}
exports.default = new AuthService();
