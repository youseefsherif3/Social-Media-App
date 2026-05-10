import { randomUUID } from "crypto";
//* Importing necessary modules and types
import { Request, Response, NextFunction } from "express";
import { HydratedDocument, Model, Types } from "mongoose";
import CommentRepository from "../../DB/repositories/comment.repository";
import PostRepository from "../../DB/repositories/post.repository ";
import { S3Service } from "../../common/service/s3.service";
import UserRepository from "../../DB/repositories/user.repository ";
import redisService from "../../common/service/redis.service";
import notificationService from "../../common/service/notification.service";
import { ICreateCommentType, IUpdateCommentType } from "./comment.validation";
import { AppError } from "../../common/utils/global_error_handling";
import { AllowCommentEnum } from "../../common/enum/post.enum";
import { Store_Enum } from "../../common/enum/multer.enum";

//* CommentService class to handle comment-related operations such as create, update, like, etc
class CommentService {
  //* Defining private properties to interact with repositories and services
  private readonly _commentRepository = new CommentRepository();
  private readonly _postModel = new PostRepository();
  private readonly _S3Service = new S3Service();
  private readonly _userRepository = new UserRepository();
  private readonly _redisService = redisService;
  private readonly _notificationService = notificationService;

  constructor() {}

  //* The createComment method to handle the logic for creating a new comment
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    const { content, postId, tags }: ICreateCommentType = req.body;
    const request = req as any;

    //* Check if the post exists and allows comments
    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
      },
    });

    if (!post) {
      throw new AppError("Post not found Please check the postId", 404);
    }

    if (post.allowComment === AllowCommentEnum.deny) {
      throw new AppError("Comments are not allowed on this post", 403);
    }

    let mentions: Types.ObjectId[] = [];
    let fcmTokens: string[] = [];

    //* Handle Tagged users in the comment and prepare notifications for them
    if (tags?.length) {
      const mentionedUsers = await this._userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });

      if (tags.length != mentionedUsers.length) {
        throw new AppError(
          "One or more tags are invalid, Please check the tags and try again",
          400,
        );
      }

      for (const tag of mentionedUsers) {
        mentions.push(tag._id);
        (await this._redisService.getFCMs(tag._id)).map((token) => {
          fcmTokens.push(token);
        });
      }
    }

    //* Handle file attachments in the comment and upload them to S3
    let urls: string[] = [];
    let folderId = randomUUID();

    if (req?.files) {
      urls = await this._S3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${request?.user?._id}/comments/${folderId}`,
        store_type: Store_Enum.memory,
      });
    }

    //* Create the comment in the database using the CommentRepository
    const comment = await this._commentRepository.create({
      attachments: urls,
      content: content!,
      createdBy: request?.user?._id,
      postId: post._id,
      tags: mentions,
      folderId,
    });

    if (!comment) {
      if (urls.length) await this._S3Service.deleteFiles(urls);
      throw new AppError("Failed to create comment, Please try again", 500);
    }

    //* Send notifications to the tagged users about the new comment
    if (fcmTokens.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `${request?.user?.userName} commented on your post`,
          body: content || "New comment attachment",
        },
      });
    }

    res.status(201).json({ message: "Comment created successfully", comment });
  };

  //* The likeComment method to handle the logic for reacting to a comment
  likeComment = async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const { reaction } = req.body;
    const request = req as any;

    //* Check if the comment exists
    const comment = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
      },
    });

    if (!comment) {
      throw new AppError("Comment not found Please check the commentId", 404);
    }

    //* Check if the user has already reacted to the comment with the same reaction to prevent duplicate reactions
    const existingReaction = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
        "likes.userId": request?.user?._id,
        "likes.reaction": reaction,
      },
    });

    if (existingReaction) {
      throw new AppError(
        `You have already reacted to this comment with ${reaction} reaction`,
        400,
      );
    }

    //* Update the comment's likes array with the new reaction from the user using the CommentRepository
    const CommentReaction = await this._commentRepository.findOneAndUpdate({
      filter: { _id: commentId },
      update: {
        $set: {
          likes: {
            userId: request?.user?._id,
            reaction,
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Comment reaction updated", CommentReaction });
  };

  //* The updateComment method to handle the logic for updating a comment (not implemented in this snippet)
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    const { content, removeFiles, removeTags, tags }: IUpdateCommentType =
      req.body;
    const { commentId } = req.params;
    const request = req as any;

    //* Check if the comment exists and is created by the requesting user to allow updates only by the comment owner
    const comment = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
        createdBy: request.user._id,
      },
    });

    if (!comment) {
      throw new AppError(
        "Comment not found or you don't have permission to update it",
        404,
      );
    }

    //* Handle file removals from the comment if there are any files to be removed specified in the request body
    if (removeFiles?.length) {
      const invalidFiles = removeFiles.filter((file: string) => {
        return !comment.attachments?.includes(file);
      });

      if (invalidFiles.length) {
        throw new AppError(
          "One or more files in removeFiles are invalid, Please check the files and try again",
          400,
        );
      }
      await this._S3Service.deleteFiles(removeFiles);

      comment.attachments = comment.attachments?.filter((file: string) => {
        return !removeFiles.includes(file);
      }) as string[];
    }

    //* Handle new file attachments in the comment and upload them to S3 if there are any new files specified in the request body
    if (req.files?.length) {
      let urls = await this._S3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${request?.user?._id}/comments/${comment.folderId}`,
        store_type: Store_Enum.memory,
      });

      comment.attachments?.push(...urls);
    }

    //* update the tags of the comment if there are any new tags specified in the request body
    const updateTags = new Set([
      ...(comment.tags?.map((id) => id.toString()) || []),
    ]);

    removeTags?.forEach((tag: string) => {
      return updateTags.delete(tag);
    });

    let fcmTokens: string[] = [];

    if (tags?.length) {
      const mentionedUsers = await this._userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });

      if (tags.length != mentionedUsers.length) {
        throw new AppError(
          "One or more tags are invalid, Please check the tags and try again",
          400,
        );
      }

      for (const tag of mentionedUsers) {
        if (tag._id.toString() == request.user._id.toString()) {
          throw new AppError("You cannot tag yourself in a post", 400);
        }

        updateTags.add(tag._id.toString());
        (await this._redisService.getFCMs(tag._id)).map((token) => {
          fcmTokens.push(token);
        });
      }

      //* Send notifications to the newly tagged users about the comment update
      if (fcmTokens.length) {
        await this._notificationService.sendNotifications({
          tokens: fcmTokens,
          data: {
            title: `the user ${request?.user?.userName} mentioned you in a post`,
            body: content || "Updated post",
          },
        });
      }
    }

    comment.tags = [...updateTags].map((id: string) => {
      return new Types.ObjectId(id);
    });

    if (content) {
      comment.content = content;
    }

    await comment.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  };

  //* The deleteComment method to handle the logic for deleting a comment
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const request = req as any;

    //* Check if the comment exists and belongs to the logged in user
    const comment = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
        createdBy: request.user._id,
      },
    });

    if (!comment) {
      throw new AppError(
        "Comment not found or you don't have permission to delete it",
        404,
      );
    }

    //* Delete the comment's attachments from S3 if there are any attachments associated with the comment
    if (comment.attachments?.length) {
      await this._S3Service.deleteFiles(comment.attachments);
    }

    //* Delete the comment
    await this._commentRepository.findOneAndDelete({
      filter: {
        _id: commentId,
      },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  };

  //* The getComments method to handle the logic for retrieving comments
  getComments = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const request = req as any;

    const comments = await this._commentRepository.paginate({
      page: request?.query?.page,
      limit: request?.query?.limit,
      search: {
        postId: postId as string, 
        ...(request.query.search
          ? {
              $or: [
                {
                  content: { $regex: request.query.search, $options: "i" },
                },
              ],
            }
          : {}),
      },
    });

    res
      .status(200)
      .json({ message: "Comments retrieved successfully", comments });
  };
}

//* Exporting an instance of the CommentService class to be used in other parts of the application
export default new CommentService();
