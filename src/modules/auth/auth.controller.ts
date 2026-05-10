//* Importing necessary modules
import { Router, RequestHandler } from "express";
import authService from "./auth.service";
import { validation } from "../../common/middleware/validation";
import * as authValidation
 from "./auth.validation";
import AuthenticationMiddleware from "../../common/middleware/authentication";
import { authorization } from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";

//* Creating a new router object
const authRouter = Router();

//* The Sign-Up API
authRouter.post(
  "/signUp",
  validation(authValidation
    .signUpSchema),
  authService.signUp,
);

//* The Sign-Up With Google API
authRouter.post("/signUp/google", authService.signUpWithGoogle);

//* The Email Confirmation API
authRouter.patch("/confirm-email", validation(authValidation
  .confirmEmailSchema), authService.confirmEmail);

//* The Resend OTP API
authRouter.patch("/resend-otp", validation(authValidation
  .resendOTPSchema), authService.resendOTP);

//* The Login API
authRouter.post("/login", validation(authValidation
  .loginSchema), authService.login);

//* The Refresh Token API
authRouter.get("/refresh-token", authService.refreshToken);

//* The Update Password API
authRouter.patch("/update-password", AuthenticationMiddleware.authentication, validation(authValidation
  .updatePasswordSchema), authService.updatePassword);

//* The Forgot Password API
authRouter.post("/forgot-password", authService.forgotPassword);

//* The Reset Password API
authRouter.post("/reset-password", validation(authValidation
  .resetPasswordSchema), authService.resetPassword);

//* The Logout API
authRouter.post("/logout", AuthenticationMiddleware.authentication, authService.logout);

//* exporting the router to be used in other parts of the application
export default authRouter;
