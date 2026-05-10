//* Importing necessary modules and types
import { Model } from "mongoose";
import BaseRepository from "./base.repository";
import PostModel, { IPost } from "../models/post.model";

//* PostRepository class to handle database operations related to the Post model
class PostRepository extends BaseRepository<IPost> {
  constructor(protected readonly model: Model<IPost> = PostModel) {
    super(model);
  }
}
            
//* Exporting the PostRepository class to be extended by specific repositories for different models
export default PostRepository;
