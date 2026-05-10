//* Importing necessary modules
import { Router, RequestHandler } from "express";
import PostService from "./post.service";
import * as postValidation from "./post.validation";
import { validation } from "../../common/middleware/validation";
import AuthenticationMiddleware from "../../common/middleware/authentication";
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";

//* Creating a new router object
const postRouter = Router();

//* The Create Post API endpoint
postRouter.post(
  "/create-post",
  AuthenticationMiddleware.authentication,
  multerCloud({ store_type: Store_Enum.memory }).array("attachments"),
  validation(postValidation.createPostSchema),
  PostService.createPost,
);

//* The Get Post API endpoint
postRouter.get(
  "/get-posts",
  AuthenticationMiddleware.authentication,
  PostService.getPosts,
);

//* The Like Post API endpoint
postRouter.patch(
  "/like-post/:postId",
  AuthenticationMiddleware.authentication,
  validation(postValidation.likePostSchema),
  PostService.likePost,
);

//* The Update Post API endpoint
postRouter.put(
  "/update-post/:postId",
  multerCloud({ store_type: Store_Enum.memory }).array("attachments"),
  AuthenticationMiddleware.authentication,
  validation(postValidation.updatePostSchema),
  PostService.updatePost,
);

//* exporting the router to be used in other parts of the application
export default postRouter;
