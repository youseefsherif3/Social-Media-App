//* Import necessary modules and Types
import mongoose, { Types } from "mongoose";
import {
  AllowCommentEnum,
  AvailabilityEnum,
  ReactionEnum,
} from "../../common/enum/post.enum";

//* Defining the IPost interface to represent the structure of a Post document in MongoDB
export interface IPost {
  content?: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  allowComment?: AllowCommentEnum;
  availability?: AvailabilityEnum;
  folderId: string;
  IsDeleted?: boolean;
}

//* Defining the Post schema using Mongoose
const PostSchema = new mongoose.Schema<IPost>(
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
    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
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
    allowComment: {
      type: String,
      enum: AllowCommentEnum,
      default: AllowCommentEnum.allow,
    },
    availability: {
      type: String,
      enum: AvailabilityEnum,
      default: AvailabilityEnum.public,
    },
    folderId: {
      type: String,
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

//* Adding a pre 'findOne' middleware to handle soft deletion by checking the 'paranoid' query parameter
PostSchema.pre("find", function() {
  this.where({ IsDeleted: false });
})

//* Creating the Post model based on the schema
const PostModel =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

//* Exporting the Post model to be used in other parts of the application
export default PostModel;
