"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const crypto_1 = require("crypto");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_service_1 = require("../../config/config.service");
const multer_enum_1 = require("../enum/multer.enum");
const node_fs_1 = __importDefault(require("node:fs"));
const global_error_handling_1 = require("../utils/global_error_handling");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_service_1.AWS_REGION,
            credentials: {
                accessKeyId: config_service_1.AWS_ACCESS_KEY,
                secretAccessKey: config_service_1.AWS_SECRET_KEY,
            },
        });
    }
    async uploadFile({ file, store_type = multer_enum_1.Store_Enum.memory, path = "General", ACL = client_s3_1.ObjectCannedACL.private, }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            ACL,
            Key: `Social_Media_App/${path}/${(0, crypto_1.randomUUID)()}__${file.originalname}`,
            Body: store_type == multer_enum_1.Store_Enum.memory
                ? file.buffer
                : node_fs_1.default.createReadStream(file.path),
            ContentType: file.mimetype,
        });
        if (!command.input.Key) {
            throw new global_error_handling_1.AppError("Failed to generate a unique key for the file upload", 500);
        }
        await this.client.send(command);
        return command.input.Key;
    }
    async uploadLargeFile({ file, store_type = multer_enum_1.Store_Enum.disk, path = "General", ACL = client_s3_1.ObjectCannedACL.private, }) {
        const command = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: config_service_1.AWS_BUCKET_NAME,
                ACL,
                Key: `Social_Media_App/${path}/${(0, crypto_1.randomUUID)()}__${file.originalname}`,
                Body: store_type == multer_enum_1.Store_Enum.memory
                    ? file.buffer
                    : node_fs_1.default.createReadStream(file.path),
                ContentType: file.mimetype,
            },
        });
        const result = await command.done();
        return result.Key;
    }
    async uploadFiles({ files, store_type = multer_enum_1.Store_Enum.memory, path = "General", ACL = client_s3_1.ObjectCannedACL.private, isLarge = false, }) {
        let urls = [];
        if (isLarge) {
            urls = await Promise.all(files.map((file) => {
                return this.uploadLargeFile({ file, store_type, path, ACL });
            }));
        }
        else {
            urls = await Promise.all(files.map((file) => {
                return this.uploadLargeFile({ file, store_type, path, ACL });
            }));
        }
        return urls;
    }
    async createPreSignedUrl({ path, fileName, ContentType, expiresIn = 60, }) {
        const Key = `Social_Media_App/${path}/${(0, crypto_1.randomUUID)()}__${fileName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
            ContentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, Key };
    }
    async getFile(Key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
        });
        return await this.client.send(command);
    }
    async getPreSignedUrl({ Key, expiresIn = 60, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async getFiles(folderName) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Prefix: `Social_Media_App/${folderName}/`,
        });
        return await this.client.send(command);
    }
    async deleteFile(Key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
        });
        return await this.client.send(command);
    }
    async deleteFiles(keys) {
        const keyMapped = keys.map((key) => {
            return { Key: key };
        });
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Delete: {
                Objects: keyMapped,
            },
        });
        return await this.client.send(command);
    }
    async deleteFolder(folderName) {
        const files = await this.getFiles(folderName);
        const keys = files?.Contents?.map((k) => {
            return k.Key;
        });
        return await this.deleteFiles(keys);
    }
}
exports.S3Service = S3Service;
