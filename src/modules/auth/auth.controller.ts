//* Importing necessary modules
import { Router, RequestHandler } from "express";
import authService from "./auth.service";
import { validation } from "../../common/middleware/validation";
import * as userValidation from "./user.validation";
import AuthenticationMiddleware from "../../common/middleware/authentication";
import { authorization } from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";

//* Creating a new router object
const authRouter = Router();

//* The Sign-Up API
authRouter.post(
  "/signUp",
  validation(userValidation.signUpSchema),
  authService.signUp,
);

//* The Sign-Up With Google API
authRouter.post("/signUp/google", authService.signUpWithGoogle);

//* The Email Confirmation API
authRouter.patch("/confirm-email", validation(userValidation.confirmEmailSchema), authService.confirmEmail);

//* The Login API
authRouter.post("/login", validation(userValidation.loginSchema), authService.login);

//* The Get Profile API
authRouter.get("/profile", AuthenticationMiddleware.authentication,authorization(RoleEnum.user) ,authService.getProfile);

//* The Refresh Token API
authRouter.get("/refresh-token", authService.refreshToken);

//* The Update Password API
authRouter.patch("/update-password", AuthenticationMiddleware.authentication, validation(userValidation.updatePasswordSchema), authService.updatePassword);

//* The Forgot Password API
authRouter.post("/forgot-password", authService.forgotPassword);

//* The Reset Password API
authRouter.post("/reset-password", validation(userValidation.resetPasswordSchema), authService.resetPassword);

//* The Logout API
authRouter.post("/logout", AuthenticationMiddleware.authentication, authService.logout);


//* exporting the router to be used in other parts of the application
export default authRouter;
