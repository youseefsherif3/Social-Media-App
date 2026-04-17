//* Importing necessary modules and types
import {
  HydratedDocument,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";
import userModel, { IUser } from "../models/user.model";
import BaseRepository from "./base.repository";
import { AppError } from "../../common/utils/global_error_handling";

//* UserRepository class to handle database operations related to the User model
class UserRepository extends BaseRepository<IUser> {
  constructor(protected readonly model: Model<IUser> = userModel) {
    super(model);
  }

}

//* Exporting the UserRepository class to be extended by specific repositories for different models
export default UserRepository;
