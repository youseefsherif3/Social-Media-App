//* Importing necessary modules and types
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import { AppError } from "../../common/utils/global_error_handling";
import UserRepository from "../../DB/repositories/user.repository ";
import { S3Service } from "../../common/service/s3.service";
import { pipeline } from "node:stream/promises";

//* AuthService class to handle authentication-related operations such as sign-up, login, etc
class UserService {
  //* Defining a private property _userModel to interact with the user collection in MongoDB
  private readonly _userModel = new UserRepository();
  private readonly _S3Service = new S3Service();

  constructor() {}

  //* The Get Profile API endpoint to retrieve the authenticated user's profile information
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const request = req as any;

    const user: HydratedDocument<IUser> = request.user;

    res.status(200).json({ message: "Profile retrieved successfully", user });
  };

  //* The Upload Profile Image API endpoint to allow users to upload their profile images
  uploadProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const request = req as any;
    // const urls = await this._S3Service.uploadFiles({
    //   files : req.files as Express.Multer.File[],
    //   path : "Users/multipleFiles"
    // })

    const { ContentType, fileName } = req.body;

    const { url, Key } = await this._S3Service.createPreSignedUrl({
      fileName,
      ContentType,
      path: `Users/${request?.user?._id}`,
    });

    await this._userModel.findOneAndUpdate({
      filter: { _id: request?.user?._id },
      update: { profileImage: Key },
    });

    res.status(200).json({
      message: "Profile image uploaded successfully",
      data: { url, Key },
    });
  };

  //* The Get Profile Image API endpoint to allow users to retrieve their profile images from S3 using the stored key in the user document
  getProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.params as { path: string[] };

    const Key = path.join("/") as string;

    const file = await this._S3Service.getFile(Key);

    const stream = file.Body as NodeJS.ReadableStream;

    res.setHeader("Content-Type", file.ContentType!);

    await pipeline(stream, res);
  };
}

//* Exporting an instance of the UserService class to be used in other parts of the application
export default new UserService();
