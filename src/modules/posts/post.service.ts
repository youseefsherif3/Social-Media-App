//* Importing necessary modules and types
import { Request, Response, NextFunction } from "express";
import { HydratedDocument, Model, Types } from "mongoose";
import { S3Service } from "../../common/service/s3.service";
import PostRepository from "../../DB/repositories/post.repository ";
import redisService from "../../common/service/redis.service";
import { ICreatePostType, IUpdatePostType } from "./post.validation";
import { AppError } from "../../common/utils/global_error_handling";
import { randomUUID } from "crypto";
import { Store_Enum } from "../../common/enum/multer.enum";
import UserRepository from "../../DB/repositories/user.repository ";
import notificationService from "../../common/service/notification.service";
import { AvailabilityEnum } from "../../common/enum/post.enum";
import { AvailabilityPost } from "../../common/utils/post.utils";
import th from "zod/v4/locales/th.js";

//* AuthService class to handle authentication-related operations such as sign-up, login, etc
class PostService {
  //* Defining a private property _postModel to interact with the post collection in MongoDB
  private readonly _postModel = new PostRepository();
  private readonly _S3Service = new S3Service();
  private readonly _userRepository = new UserRepository();
  private readonly _redisService = redisService;
  private readonly _notificationService = notificationService;

  constructor() {}

  //* The createPost method to handle the logic for creating a new post
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { allowComment, availability, content, tags }: ICreatePostType =
      req.body;

    let mentions: Types.ObjectId[] = [];

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
        mentions.push(tag._id);
        (await this._redisService.getFCMs(tag._id)).map((token) => {
          fcmTokens.push(token);
        });
      }
    }

    let urls: string[] = [];
    let folderId = randomUUID();
    let request = req as any;

    if (req?.files) {
      urls = await this._S3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${request?.user?._id}/posts/${folderId}`,
        store_type: Store_Enum.memory,
      });
    }

    const post = await this._postModel.create({
      attachments: urls,
      content: content!,
      createdBy: request?.user?._id,
      tags: mentions,
      folderId,
      availability,
      allowComment,
    });

    if (!post) {
      await this._S3Service.deleteFiles(urls);
      throw new AppError("Failed to create post, Please try again", 500);
    }

    if (fcmTokens.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `the user ${request?.user?.userName} mentioned you in a post`,
          body: content || "New post",
        },
      });
    }

    res.status(201).json({ message: "Post created successfully", post: post });
  };

  //* The getPosts method to handle the logic for retrieving posts
  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const request = req as any;

    const posts = await this._postModel.paginate({
      page: request?.query?.page,
      limit: request?.query?.limit,
      search: {
        ...AvailabilityPost(request),
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

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  };

  //* The likePost method to handle the logic for liking a post
  likePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { reaction } = req.body;
    const request = req as any;

    const existingReaction = await this._postModel.findOne({
      filter: {
        _id: postId,
        "likes.userId": request.user._id,
        "likes.reaction": reaction,
      },
    });

    if (existingReaction) {
      throw new AppError(
        "You have already reacted to this post with the same reaction",
        400,
      );
      return;
    }

    const post = await this._postModel.findOneAndUpdate({
      filter: {
        _id: postId,
        ...AvailabilityPost(request),
      },
      update: {
        $set: {
          likes: { userId: request.user._id, reaction },
        },
      },
    });

    if (!post) {
      throw new AppError("Post not found or you don't have access to it", 404);
    }

    res.status(200).json({ message: "Post liked successfully", post });
  };

  //* The updatePost method to handle the logic for updating a post
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const {
      allowComment,
      availability,
      content,
      tags,
      removeFiles,
      removeTags,
    }: IUpdatePostType = req.body;
    const { postId } = req.params;
    const request = req as any;

    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        createdBy: request.user._id,
      },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (removeFiles?.length) {
      const invalidFiles = removeFiles.filter((file: string) => {
        return !post.attachments?.includes(file);
      });

      if (invalidFiles.length) {
        throw new AppError(
          "One or more files in removeFiles are invalid, Please check the files and try again",
          400,
        );
      }
      await this._S3Service.deleteFiles(removeFiles);

      post.attachments = post.attachments?.filter((file: string) => {
        return !removeFiles.includes(file);
      }) as string[];
    }

    const updateTags = new Set(post?.tags?.map((id) => id.toString()));

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

      post.tags = [...updateTags].map((id: string) => {
        return new Types.ObjectId(id);
      });
    }

    if (req.files?.length) {
      let urls = await this._S3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${request?.user?._id}/posts/${post.folderId}`,
        store_type: Store_Enum.memory,
      });

      post.attachments?.push(...urls);
    }

    if (fcmTokens.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `the user ${request?.user?.userName} mentioned you in a post`,
          body: content || "Updated post",
        },
      });
    }

    if (content) {
      post.content = content;
    }

    if (availability) {
      post.availability = availability;
    }

    if (allowComment) {
      post.allowComment = allowComment;
    }

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  };
}

//* Exporting an instance of the PostService class to be used in other parts of the application
export default new PostService();
