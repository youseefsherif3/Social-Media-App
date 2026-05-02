"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store_Enum = exports.MulterEnum = void 0;
exports.MulterEnum = {
    image: [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/heic",
        "image/heif",
    ],
    video: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-ms-wmv",
        "video/webm",
        "video/ogg",
    ],
    audio: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/flac",
        "audio/aac",
        "audio/webm",
        "audio/opus",
    ],
    pdf: ["application/pdf"],
};
var Store_Enum;
(function (Store_Enum) {
    Store_Enum["disk"] = "disk";
    Store_Enum["memory"] = "memory";
})(Store_Enum || (exports.Store_Enum = Store_Enum = {}));
