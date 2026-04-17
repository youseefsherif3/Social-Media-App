"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashPassword = HashPassword;
exports.ComparePassword = ComparePassword;
const bcrypt_1 = require("bcrypt");
const config_service_1 = require("../../../config/config.service");
function HashPassword({ plainText, saltRounds = config_service_1.SALT_ROUNDS, }) {
    return (0, bcrypt_1.hashSync)(plainText, saltRounds);
}
function ComparePassword({ plainText, cipherText, }) {
    return (0, bcrypt_1.compareSync)(plainText, cipherText);
}
