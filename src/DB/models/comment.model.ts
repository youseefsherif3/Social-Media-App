//* Import necessary modules and Types
import mongoose, { Types } from "mongoose";
import { OnModelEnum, ReactionEnum } from "../../common/enum/post.enum";

//* Defining the IComment interface to represent the structure of a Comment document in MongoDB
export interface IComment {
  content?: string;
  folderId: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  refId: Types.ObjectId;
  tags?: Types.ObjectId[];
  likes?: {
    userId: Types.ObjectId;
    reaction: ReactionEnum;
  }[];
  IsDeleted?: boolean;
  onModel: OnModelEnum;
}

//* Defining the Comment schema using Mongoose
const CommentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      min: 3,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    refId: {
      type: Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    likes: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "User",
        },
        reaction: {
          type: String,
          enum: ReactionEnum,
          default: ReactionEnum.like,
        },
      },
    ],
    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    folderId: {
      type: String,
    },
    onModel: {
      type: String,
      enum: OnModelEnum,
      required: true,
    },
    IsDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//* Adding pre middlewares to handle soft deletion
CommentSchema.pre("find", function () {
  this.where({ IsDeleted: false });
});

CommentSchema.pre("findOne", function () {
  this.where({ IsDeleted: false });
});

//* Adding a virtual field 'replies' to the Comment schema
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "refId",
});

//* Creating the Comment model based on the schema
const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

//* Exporting the Comment model to be used in other parts of the application
export default CommentModel;
