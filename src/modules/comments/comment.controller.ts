//* Importing necessary modules and types
import { Router } from "express";
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";
import AuthenticationMiddleware from "../../common/middleware/authentication";
import { validation } from "../../common/middleware/validation";
import * as commentValidation from "./comment.validation";
import CommentService from "./comment.service";

//* Creating a new router object
const commentRouter = Router({ mergeParams: true });

//* The Create Comment API endpoint
commentRouter.post(
  "/create-comment",
  AuthenticationMiddleware.authentication,
  multerCloud({ store_type: Store_Enum.memory }).array("attachments"),
  validation(commentValidation.createCommentSchema),
  CommentService.createComment,
);

//* The Reply to Comment API endpoint
// commentRouter.post(
//   "/reply-comment/:commentId",
//   AuthenticationMiddleware.authentication,
//   multerCloud({ store_type: Store_Enum.memory }).array("attachments"),
//   validation(commentValidation.replyCommentSchema),
//   CommentService.createReply,
// );

//* The Like Comment API endpoint
commentRouter.patch(
  "/like-comment/:commentId",
  AuthenticationMiddleware.authentication,
  validation(commentValidation.likeCommentSchema),
  CommentService.likeComment,
);

//* The Update Comment API endpoint
commentRouter.put(
  "/update-comment/:commentId",
  multerCloud({ store_type: Store_Enum.memory }).array("attachments"),
  AuthenticationMiddleware.authentication,
  validation(commentValidation.updateCommentSchema),
  CommentService.updateComment,
);

//* The Delete Comment API endpoint
commentRouter.delete(
  "/delete-comment/:commentId",
  AuthenticationMiddleware.authentication,
  validation(commentValidation.deleteCommentSchema),
  CommentService.deleteComment,
);

//* The Get Comments for a Post API endpoint
commentRouter.get(
  "/get-comments",
  AuthenticationMiddleware.authentication,
  validation(commentValidation.getCommentsSchema),
  CommentService.getComments,
);

//* exporting the router to be used in other parts of the application
export default commentRouter;
