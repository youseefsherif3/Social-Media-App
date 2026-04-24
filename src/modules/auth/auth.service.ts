//* Importing necessary modules and types
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import {
  IConfirmEmailType,
  ILoginType,
  IResendOTPType,
  IResetPasswordType,
  ISignUpType,
  IUpdatePasswordType,
} from "./user.validation";
import { AppError } from "../../common/utils/global_error_handling";
import UserRepository from "../../DB/repositories/user.repository ";
import { EncryptData } from "../../common/utils/security/encrypt.security";
import {
  ComparePassword,
  HashPassword,
} from "../../common/utils/security/hashing.security";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email";
import { emailTemplate } from "../../common/utils/email/email.template";
import { EmailEnum, FlagEnum, ProviderEnum } from "../../common/enum/user.enum";
import {
  REFRESH_TOKEN_SECRET_KEY,
  TOKEN_SECRET_KEY,
  WEB_CLIENT_ID,
} from "../../config/config.service";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "crypto";
import redisService from "../../common/service/redis.service";
import { Eventemitter } from "../../common/utils/email/email.events";
import tokenService from "../../common/utils/token.service";
import { log } from "console";

//* AuthService class to handle authentication-related operations such as sign-up, login, etc
class AuthService {
  //* Defining a private property _userModel to interact with the user collection in MongoDB
  private readonly _userModel = new UserRepository();
  private readonly _redisService = redisService;
  private readonly _tokenService = tokenService;

  constructor() {}

  //* The Send Email OTP method to send a One-Time Password (OTP)
  sendEmailOtp = async ({
    email,
    userName,
  }: {
    email: string;
    userName: string;
  }) => {
    const isBlocked = await this._redisService.checkTTLMethod(
      this._redisService.block_OTP_Key(email),
    );

    if (isBlocked && isBlocked > 0) {
      throw new AppError("Too many OTP requests, please try again later", 429);
    }

    const ttlOtp = await this._redisService.checkTTLMethod(
      this._redisService.OTP_Key(email),
    );

    if (ttlOtp && ttlOtp > 0) {
      throw new AppError(
        "OTP already sent, please check your email or request a new OTP after some time",
        429,
      );
    }

    if (
      (await this._redisService.getMethod(this._redisService.OTP_Key(email))) >=
      3
    ) {
      await this._redisService.setMethod({
        key: this._redisService.block_OTP_Key(email),
        value: "1",
        ttl: 60 * 60,
      });

      throw new AppError("Too many OTP requests, please try again later", 429);
    }

    const OTP = await generateOTP();

    Eventemitter.emit(EmailEnum.verification, async () => {
      await sendEmail({
        to: email,
        subject: "Verify Your Email for Social Connect",
        html: emailTemplate(OTP, userName),
      });
      await this._redisService.setMethod({
        key: this._redisService.OTP_Key(email),
        value: HashPassword({ plainText: OTP.toString() }),
        ttl: 10 * 60,
      });

      await this._redisService.incrMethod(
        this._redisService.max_OTP_Key(email),
      );
    });
  };

  //* The Sign-Up API endpoint to create a new user account
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    let {
      userName,
      email,
      password,
      confirmPassword,
      age,
      gender,
      address,
      phone,
    }: ISignUpType = req.body;

    //* Checking if a user with the provided email already exists in the database
    const existingUser: HydratedDocument<IUser> | null =
      await this._userModel.findOne({ filter: { email } });
    if (existingUser) {
      throw new AppError(
        "Email already in use, please use a different email",
        409,
      );
    }

    //* Creating a new user document in the database with the provided information
    const newUser: HydratedDocument<IUser> = await this._userModel.create({
      userName,
      email,
      password: HashPassword({ plainText: password }),
      age,
      gender,
      address,
      phone: phone ? EncryptData(phone) : null,
      changeCredentials: new Date(),
    } as Partial<IUser>);

    //* Generating a One-Time Password (OTP) for email verification after successful sign-up
    const OTP = await generateOTP();

    //* Sending a verification email to the user's email address with the generated OTP using the sendEmail utility function and the email template
    Eventemitter.emit(EmailEnum.verification, async () => {
      await sendEmail({
        to: email,
        subject: "Verify Your Email for Social Connect",
        html: emailTemplate(OTP, userName),
      });

      //* Storing the OTP in Redis with a TTL of 10 minutes for later verification when the user attempts to verify their email
      await this._redisService.setMethod({
        key: this._redisService.OTP_Key(email),
        value: HashPassword({ plainText: OTP.toString() }),
        ttl: 10 * 60,
      });
    });

    res
      .status(201)
      .json({ message: "User signed up successfully", user: newUser });
  };

  //* The Sign-Up With Google API endpoint to allow users to sign up using their Google account
  signUpWithGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { idToken }: { idToken: string } = req.body;
    const client = new OAuth2Client();

    const ticket: any = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      email,
      email_verified,
      name,
    }: { email: string; email_verified: boolean; name: string } = payload;

    let user: HydratedDocument<IUser> | null = await this._userModel.findOne({
      filter: { email },
    });

    if (!user) {
      user = await this._userModel.create({
        email,
        userName: name,
        confirmed: email_verified,
        provider: ProviderEnum.google,
      });
    }

    if (user.provider == ProviderEnum.local) {
      throw new AppError(
        "Email already in use, please use a different email or log in with your credentials",
        409,
      );
    }

    const jwtid = randomUUID();

    const token = this._tokenService.generateToken({
      payload: { userId: user._id, email: user.email },
      secret_key: TOKEN_SECRET_KEY,
      options: { expiresIn: "1h", jwtid },
    });

    res
      .status(200)
      .json({ message: "Login with Google account successful", token });
  };

  //* The Confirm Email API endpoint to verify the user's email address using the OTP sent to their email
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    let { email, OTP }: IConfirmEmailType = req.body;

    //* Checking if the OTP exists in Redis for the provided email
    const OTPExists = await this._redisService.getMethod(
      this._redisService.OTP_Key(email),
    );

    if (!OTPExists) {
      throw new AppError("OTP has expired, please request a new one", 400);
    }

    //* Comparing the provided OTP with the hashed OTP stored in Redis using the ComparePassword utility function to verify if they match
    if (
      !ComparePassword({ plainText: OTP.toString(), cipherText: OTPExists })
    ) {
      throw new AppError(
        "Invalid OTP, please check the OTP and try again",
        400,
      );
    }

    //* Updating the user's document in the database to set the confirmed field to true
    const user = await this._userModel.findOneAndUpdate({
      filter: { email },
      update: { confirmed: true },
    });

    //* If the user is not found in the database, throwing an error indicating that the user was not found
    if (!user) {
      throw new AppError(
        "User not found, please check the email and try again",
        404,
      );
    }

    //* Deleting the OTP from Redis after successful email confirmation to clean up and prevent reuse of the OTP
    await this._redisService.deleteMethod(this._redisService.OTP_Key(email));

    res.status(200).json({ message: "Email confirmed successfully" });
  };

  //* The Resend OTP API endpoint to allow users to request a new OTP
  resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: IResendOTPType = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmed: false,
        provider: ProviderEnum.local,
      },
    });

    if (!user) {
      throw new AppError(
        "User not found or already confirmed, please check the email and try again",
        404,
      );
    }

    await this.sendEmailOtp({ email, userName: user.userName });

    res.status(200).json({
      message: "OTP resent successfully, please check your email",
    });
  };

  //* The Login API endpoint to authenticate a user and generate a JWT token
  login = async (req: Request, res: Response, next: NextFunction) => {
    let { email, password }: ILoginType = req.body;

    //* Checking if a user with the provided email exists in the database
    const user: HydratedDocument<IUser> | null = await this._userModel.findOne({
      filter: { email, confirmed: true, provider: ProviderEnum.local },
    });

    if (!user) {
      throw new AppError(
        "Invalid email or password, please check your credentials and try again",
        401,
      );
    }

    if (user.confirmed === false) {
      throw new AppError(
        "Email not confirmed, please confirm your email before logging in",
        401,
      );
    }

    //* Comparing the provided password with the hashed password stored in the database
    if (!ComparePassword({ plainText: password, cipherText: user.password })) {
      throw new AppError(
        "Invalid email or password, please check your credentials and try again",
        401,
      );
    }

    const jwtid = randomUUID();

    //* Generating a JWT token for the authenticated user
    const token = this._tokenService.generateToken({
      payload: { userId: user._id, email: user.email },
      secret_key: TOKEN_SECRET_KEY,
      options: { expiresIn: "1h", jwtid },
    });

    const refreshToken = this._tokenService.generateToken({
      payload: { userId: user._id, email: user.email },
      secret_key: REFRESH_TOKEN_SECRET_KEY,
      options: { expiresIn: "1y", jwtid },
    });

    res.status(200).json({ message: "Login successful", token, refreshToken });
  };

  //* The Get Profile API endpoint to retrieve the authenticated user's profile information
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const request = req as any;

    const user: HydratedDocument<IUser> = request.user;

    res.status(200).json({ message: "Profile retrieved successfully", user });
  };

  //* The Refresh Token API endpoint to generate a new JWT token using a valid refresh token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError(
        "Unauthorized access, please provide a valid refresh token",
        401,
      );
    }

    const decoded: any = this._tokenService.verifyToken({
      token: authorization,
      secret_key: REFRESH_TOKEN_SECRET_KEY!,
    });

    if (!decoded || !decoded?.userId) {
      throw new AppError("Unauthorized access, invalid token", 401);
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

    const jwtid = randomUUID();

    const token = this._tokenService.generateToken({
      payload: { userId: user._id, email: user.email },
      secret_key: TOKEN_SECRET_KEY,
      options: { expiresIn: "1h", jwtid },
    });

    res.status(200).json({ message: "Token refreshed successfully", token });
  };

  //* The Update Password API endpoint to allow authenticated users to update their password
  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    let { currentPassword, newPassword }: IUpdatePasswordType = req.body;

    const request = req as any;

    //* Comparing the provided current password with the hashed password stored in the database
    if (
      !ComparePassword({
        plainText: currentPassword,
        cipherText: request.user.password,
      })
    ) {
      throw new AppError(
        "Invalid current password, please check your password and try again",
        401,
      );
    }

    //* Hashing the new password using the HashPassword utility function
    const hashedNewPassword = HashPassword({ plainText: newPassword });

    request.user.password = hashedNewPassword;

    await request.user.save();

    res.status(200).json({ message: "Password updated successfully" });
  };

  //* The Forgot Password API endpoint to allow users to reset their password
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: { email: string } = req.body;

    const user: HydratedDocument<IUser> | null = await this._userModel.findOne({
      filter: { email, confirmed: true, provider: ProviderEnum.local },
    });

    if (!user) {
      throw new AppError(
        "User Not Found, please check the email and try again",
        404,
      );
    }

    const OTP = await generateOTP();

    await sendEmail({
      to: email,
      subject: "Reset Your Password for Social Connect",
      html: emailTemplate(OTP, user.userName),
    });

    await this._redisService.setMethod({
      key: this._redisService.OTP_Key(email),
      value: HashPassword({ plainText: OTP.toString() }),
      ttl: 10 * 60,
    });

    res.status(200).json({
      message: "Password reset OTP sent to your email successfully",
    });
  };

  //* The Reset Password API endpoint to allow users to reset their password using the OTP
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    let { email, OTP, newPassword }: IResetPasswordType = req.body;

    const user: HydratedDocument<IUser> | null = await this._userModel.findOne({
      filter: { email, confirmed: true, provider: ProviderEnum.local },
    });

    if (!user) {
      throw new AppError(
        "User Not Found, please check the email and try again",
        404,
      );
    }

    const OTPExists = await this._redisService.getMethod(
      this._redisService.OTP_Key(email),
    );
    if (!OTPExists) {
      throw new AppError("OTP has expired, please request a new one", 400);
    }

    if (
      !ComparePassword({ plainText: OTP.toString(), cipherText: OTPExists })
    ) {
      throw new AppError(
        "Invalid OTP, please check the OTP and try again",
        400,
      );
    }

    await this._userModel.findOneAndUpdate({
      filter: { email },
      update: { password: HashPassword({ plainText: newPassword }) },
    });

    await this._redisService.deleteMethod(this._redisService.OTP_Key(email));

    res.status(200).json({ message: "Password reset successfully" });
  };

  //* The Logout API endpoint to allow authenticated users to log out
  logout = async (req: Request, res: Response, next: NextFunction) => {
    const request = req as any;
    // const decoded = request.decoded;

    const { flag } = req.query;

    if (flag === FlagEnum.allDevices) {
      request.user.changeCredentials = new Date();

      await request.user.save();

      await this._redisService.deleteMethod(
        await this._redisService.keys(
          `revokedTokens:${request.user._id.toString()}`,
        ),
      );
    } else {
      await this._redisService.setMethod({
        key: `revokedTokens:${request.user._id.toString()}:${request.decoded.jti}`,
        value: `${request.decoded.jti}`,
        ttl: Math.max(request.decoded.exp - Math.floor(Date.now() / 1000), 1),
      });
    }

    res.status(200).json({ message: "Logged out successfully" });
  };
}

//* Exporting an instance of the AuthService class to be used in other parts of the application
export default new AuthService();
