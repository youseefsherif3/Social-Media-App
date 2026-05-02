//* Importing necessary modules
import { Router, RequestHandler } from "express";
import userService from "./user.service";
import { validation } from "../../common/middleware/validation";
import * as userValidation from "./user.validation";
import AuthenticationMiddleware from "../../common/middleware/authentication";
import { authorization } from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";

//* Creating a new router object
const userRouter = Router();

//* The Get Profile API
userRouter.get(
  "/profile",
  AuthenticationMiddleware.authentication,
  authorization(RoleEnum.user),
  userService.getProfile,
);

//* The Upload Profile Image API
userRouter.post(
  "/profile/upload-image",
  AuthenticationMiddleware.authentication,
  // multerCloud({ store_type: Store_Enum.memory }).array("attachment"),
  userService.uploadProfileImage,
);

//* The Get Profile Image API
userRouter.get(
  "/profile/image/*path",
  // AuthenticationMiddleware.authentication,
  userService.getProfileImage,
);

//* exporting the router to be used in other parts of the application
export default userRouter;
