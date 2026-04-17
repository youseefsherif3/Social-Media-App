//* Import necessary modules and Types
import mongoose, { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum";

//* Defining the IUser interface to represent the structure of a user document in MongoDB
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  age: number;
  phone?: string;
  address?: string;
  gender?: GenderEnum;
  role?: RoleEnum;
  provider? : ProviderEnum;
  confirmed: boolean;
  changeCredentials?: Date;
  createdAt: Date;
  updatedAt: Date;
}

//* Defining the user schema using Mongoose
const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 25,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 25,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.google ? false : true;
      },
      trim: true,
      min: 6,
      max: 30,
    },
    age: {
      type: Number,
      trim: true,
      min: 13,
      max: 60,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: GenderEnum,
      default: GenderEnum.male,
    },
    role: {
      type: String,
      enum: RoleEnum,
      default: RoleEnum.user,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ProviderEnum,
      default: ProviderEnum.local,
    },
    changeCredentials: {
      type: Date,
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

//* Creating a virtual property 'userName' that concatenates firstName and lastName
userSchema
  .virtual("userName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (val: string) {
    this.set({ firstName: val.split(" ")[0], lastName: val.split(" ")[1] });
  });

//* Creating the user model based on the schema
const userModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

//* Exporting the user model to be used in other parts of the application
export default userModel;
