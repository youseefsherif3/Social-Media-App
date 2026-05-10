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

//* BaseRepository class to provide common database operations for different models
abstract class BaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  //* Method to create a new document in the database
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }

  //* Method to find a document by its ID
  async findById(
    id: Types.ObjectId,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findById(id);
  }

  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[]> {
    return this.model.find(filter, projection, options);
  }

  //* Method to find a document by a specific field and value
  async findOne({
    filter,
    projection,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter, projection);
  }

  //* Method to find multiple documents based on a filter and optional projection
  async findMany({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[] | []> {
    return this.model
      .find(filter, projection)
      .sort(options?.sort)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .populate(options?.populate as PopulateOptions);
  }

  //* Method to find a document by its ID and update it with new data
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
  }

  //* Method to find a document by a specific field and value and update it with new data
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });
  }

  //* Method to delete a document by its ID
  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Types.ObjectId;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findByIdAndDelete(id, options);
  }

  //* Method to delete a document by a specific field and value
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOneAndDelete(filter, options);
  }

  //* Method to paginate through documents based on a filter, sort, and search criteria
  async paginate({
    page,
    limit,
    sort,
    search,
  }: {
    page?: number;
    limit?: number;
    sort?: any;
    search?: QueryFilter<TDocument>;
  }) {
    page = +page! || 1;
    limit = +limit! || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const [data, totalDocs] = await Promise.all([
      await this.model
        .find({ ...(search ?? {}) })
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec(),
      await this.model.countDocuments({ ...(search ?? {}) }),
    ]);

    return {
      meta: {
        currentPage: page,
        limit,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
      },
      data,
    };
  }
}

//* Exporting the BaseRepository class to be extended by specific repositories for different models
export default BaseRepository;
