//* Importing the necessary modules and enums
import multer from "multer";
import { MulterEnum, Store_Enum } from "../enum/multer.enum";
import { tmpdir } from "node:os";
import { Request } from "express";

//* Defining a function to configure multer for cloud storage
const multerCloud = ({
  store_type = Store_Enum.memory,
  customType = MulterEnum.image,
  maxSize = 5 * 1024 * 1024, // Default max file size is 5MB
}: {
  store_type?: Store_Enum;
  customType?: string[];
  maxSize? : number;
} = {}) => {
  const storage =
    store_type === Store_Enum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb: Function) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + "-" + file.originalname);
          },
        });

  function fileFilter(req: Request, file: Express.Multer.File, cb: Function) {
    if (!customType.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  }

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  }); 
  return upload;
};

export default multerCloud;
