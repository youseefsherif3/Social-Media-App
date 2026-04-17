"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptData = EncryptData;
exports.DecryptData = DecryptData;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_service_1 = require("../../../config/config.service");
const key = Buffer.from(config_service_1.ENCRYPTION_KEY);
function EncryptData(text) {
    const iv = node_crypto_1.default.randomBytes(config_service_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}
function DecryptData(text) {
    const [IVHex, encryptedText] = text.split(":");
    const iv = Buffer.from(IVHex, "hex");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
