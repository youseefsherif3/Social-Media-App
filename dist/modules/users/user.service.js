"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("../../DB/repositories/user.repository "));
const s3_service_1 = require("../../common/service/s3.service");
const promises_1 = require("node:stream/promises");
class UserService {
    _userModel = new user_repository_1.default();
    _S3Service = new s3_service_1.S3Service();
    constructor() { }
    getProfile = async (req, res, next) => {
        const request = req;
        const user = request.user;
        res.status(200).json({ message: "Profile retrieved successfully", user });
    };
    uploadProfileImage = async (req, res, next) => {
        const request = req;
        const { ContentType, fileName } = req.body;
        const { url, Key } = await this._S3Service.createPreSignedUrl({
            fileName,
            ContentType,
            path: `Users/${request?.user?._id}`,
        });
        res.status(200).json({
            message: "Profile image uploaded successfully",
            data: { url, Key },
        });
    };
    getProfileImage = async (req, res, next) => {
        const { path } = req.params;
        const Key = path.join("/");
        const file = await this._S3Service.getFile(Key);
        const stream = file.Body;
        res.setHeader("Content-Type", file.ContentType);
        await (0, promises_1.pipeline)(stream, res);
    };
}
exports.default = new UserService();
