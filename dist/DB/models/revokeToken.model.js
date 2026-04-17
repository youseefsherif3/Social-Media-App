"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeTokenSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.revokeTokenSchema = new mongoose_1.default.Schema({
    tokenId: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
    strictQuery: true,
});
exports.revokeTokenSchema.index({ userId: 1 }, { expireAfterSeconds: 0 });
const RevokeTokenModel = mongoose_1.default.models.RevokeToken || mongoose_1.default.model("RevokeToken", exports.revokeTokenSchema);
exports.default = RevokeTokenModel;
