//* Importing necessary modules and types
import * as z from "zod";
import {
  AllowCommentEnum,
  AvailabilityEnum,
  ReactionEnum,
} from "../../common/enum/post.enum";
import { generalRules } from "../../common/utils/general.rules";

//* Validation schema for creating a post
export const createPostSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(generalRules.file).optional(),
      tags: z.array(generalRules.id).optional(),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
      allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow),
    })
    .superRefine((args, ctx) => {
      //* Custom validation to ensure that either content or attachments are provided when creating a post
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
};

//* Validation schema for liking a post
export const likePostSchema = {
  params: z.object({
    postId: generalRules.id,
  }),
  body: z.object({
    reaction: z.enum(ReactionEnum).default(ReactionEnum.like),
  }),
};

//* Validation schema for updating a post
export const updatePostSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(generalRules.file).optional(),
      tags: z.array(generalRules.id).optional(),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
      allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow),
      removeTags: z.array(generalRules.id).optional(),
      removeFiles: z.array(z.string()).optional(),
    })
    .superRefine((args, ctx) => {
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

  params: likePostSchema.params,
};

//* Exporting TypeScript type for the request body of the Create Post API
export type ICreatePostType = z.infer<typeof createPostSchema.body>;
export type ILikePostType = z.infer<typeof likePostSchema.body>;
export type IUpdatePostType = z.infer<typeof updatePostSchema.body>;
