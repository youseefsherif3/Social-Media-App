//* Importing necessary modules and types
import { Model } from "mongoose";
import BaseRepository from "./base.repository";
import CommentModel, { IComment } from "../models/comment.model";

//* CommentRepository class to handle database operations related to the Comment model
class CommentRepository extends BaseRepository<IComment> {
  constructor(protected readonly model: Model<IComment> = CommentModel) {
    super(model);
  }
}
            
//* Exporting the CommentRepository class to be extended by specific repositories for different models
export default CommentRepository;
