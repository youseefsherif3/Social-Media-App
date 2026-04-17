//* Import the types for Express request, response, and next function , elc
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/global_error_handling";
import { verifyToken } from "../utils/token.service";
import { TOKEN_SECRET_KEY } from "../../config/config.service";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument } from "mongoose";
import UserRepository from "../../DB/repositories/user.repository ";
import { getMethod } from "../../DB/redis/redis.service";

//* AuthenticationMiddleware class to handle authentication-related middleware functions
class AuthenticationMiddleware {
  private readonly _userModel = new UserRepository();

  constructor() {}

  authentication = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    //* Checking if the Authorization header is present in the request headers
    if (!authorization) {
      throw new AppError(
        "Unauthorized access, please provide a valid token",
        401,
      );
    }

    //* Verifying the provided token using the verifyToken utility function
    const decoded: any = verifyToken({
      token: authorization,
      secret_key: TOKEN_SECRET_KEY!,
    });

    if (!decoded || !decoded?.userId) {
      throw new AppError("Unauthorized access, invalid token", 401);
    }

    if (decoded?.jti) {
      const revokedToken = await getMethod(
        `revokedTokens:${decoded.userId}:${decoded.jti}`,
      );

      if (revokedToken) {
        throw new AppError("Unauthorized access, token is revoked", 401);
      }
    }

    const user: HydratedDocument<IUser> | null = await this._userModel.findById(
      decoded.userId,
    );

    if (!user) {
      throw new AppError(
        "Unauthorized access, user associated with the token not found",
        401,
      );
    }

    if (user.changeCredentials!.getTime() > decoded.iat * 1000) {
      throw new AppError("Unauthorized access, token is invalid", 401);
    }

    const revokedToken = await getMethod(
      `revokedTokens:${user._id.toString()}:${decoded.jti}`,
    );

    if (revokedToken) {
      throw new AppError("Unauthorized access, token is revoked", 401);
    }

    const request = req as any;

    request.user = user;
    request.decoded = decoded;

    next();
  };
}

export default new AuthenticationMiddleware();
