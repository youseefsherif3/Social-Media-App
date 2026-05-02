//* The Enum for Multer File Types
export const MulterEnum = {
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

//* The Enum for Multer Storage Types
export enum Store_Enum {
  disk = "disk",
  memory = "memory",
}
