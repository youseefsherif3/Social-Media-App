//* Importing necessary modules and types
import * as z from "zod";
import { OnModelEnum, ReactionEnum } from "../../common/enum/post.enum";
import { generalRules } from "../../common/utils/general.rules";

//* Validation schema for creating a comment
export const createCommentSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(generalRules.file).optional(),
      tags: z.array(generalRules.id).optional(),
      onModel: z.enum(OnModelEnum),
    })
    .superRefine((args, ctx) => {
      //* Custom validation to ensure that either content or attachments are provided when creating a comment
      if (!args.content && !args.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Either content or attachments must be provided",
        });
      }

      //* Custom validation to ensure that there are no duplicate tags in the request body
      if (args?.tags) {
        const uniqueTags = new Set(args.tags);
        if (args.tags.length !== uniqueTags.size) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplicate tags are not allowed",
          });
        }
      }
    }),

  params: z.object({
    postId: generalRules.id,
    commentId: generalRules.id.optional(),
  }),
};

//* Validation schema for replying to a comment
export const replyCommentSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(generalRules.file).optional(),
      tags: z.array(generalRules.id).optional(),
    })
    .superRefine((args, ctx) => {
      if (!args.content && !args.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Either content or attachments must be provided",
        });
      }

      if (args?.tags) {
        const uniqueTags = new Set(args.tags);
        if (args.tags.length !== uniqueTags.size) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplicate tags are not allowed",
          });
        }
      }
    }),
  params: z.object({
    postId: generalRules.id,
    commentId: generalRules.id,
  }),
};

//* Validation schema for liking a comment
export const likeCommentSchema = {
  params: z.object({
    commentId: generalRules.id,
  }),
  body: z.object({
    reaction: z.enum(ReactionEnum).default(ReactionEnum.like),
  }),
};

//* Validation schema for updating a comment
export const updateCommentSchema = {
  body: z.object({
    content: z.string().optional(),
    attachments: z.array(generalRules.file).optional(),
    removeFiles: z.array(z.string()).optional(),
    tags: z.array(generalRules.id).optional(),
    removeTags: z.array(generalRules.id).optional(),
  }),
  params: likeCommentSchema.params,
};

//* Validation schema for deleting a comment
export const deleteCommentSchema = {
  params: z.object({
    commentId: generalRules.id,
  }),
};

//* Validation schema for getting all comments of a specific post
export const getCommentsSchema = {
  params: z.object({
    postId: generalRules.id,
  }),
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
};

//* Exporting TypeScript type for the request body of the Comment APIs
export type ICreateCommentType = z.infer<typeof createCommentSchema.body>;
export type ILikeCommentType = z.infer<typeof likeCommentSchema.body>;
export type IUpdateCommentType = z.infer<typeof updateCommentSchema.body>;
export type IGetCommentsType = z.infer<typeof getCommentsSchema.query>;
