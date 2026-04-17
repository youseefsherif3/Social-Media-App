//* Importing necessary modules and types from Mongoose
import mongoose, { Types } from "mongoose";

//* Defining the IRevokeToken interface 
export interface IRevokeToken {
  tokenId: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}

//* Defining the revoke token schema using Mongoose
export const revokeTokenSchema = new mongoose.Schema<IRevokeToken>(
  {
    tokenId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

//* Creating an index on the userId field to automatically delete expired tokens
revokeTokenSchema.index({ userId: 1 }, { expireAfterSeconds: 0 });

//* Creating the RevokeTokenModel using the revoke token schema
const RevokeTokenModel = mongoose.models.RevokeToken || mongoose.model<IRevokeToken>("RevokeToken", revokeTokenSchema);

//* Exporting the RevokeTokenModel for use in other parts of the application
export default RevokeTokenModel;
