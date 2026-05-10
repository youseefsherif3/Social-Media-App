//* Importing necessary modules and types
import { Model } from "mongoose";
import userModel, { IUser } from "../models/user.model";
import BaseRepository from "./base.repository";

//* UserRepository class to handle database operations related to the User model
class UserRepository extends BaseRepository<IUser> {
  constructor(protected readonly model: Model<IUser> = userModel) {
    super(model);
  }
}

//* Exporting the UserRepository class to be extended by specific repositories for different models
export default UserRepository;
