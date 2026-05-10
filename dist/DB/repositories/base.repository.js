"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async find({ filter, projection, options, }) {
        return this.model.find(filter, projection, options);
    }
    async findOne({ filter, projection, }) {
        return this.model.findOne(filter, projection);
    }
    async findMany({ filter, projection, options, }) {
        return this.model
            .find(filter, projection)
            .sort(options?.sort)
            .skip(options?.skip)
            .limit(options?.limit)
            .populate(options?.populate);
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    async findOneAndUpdate({ filter, update, options, }) {
        return this.model.findOneAndUpdate(filter, update, {
            new: true,
            ...options,
        });
    }
    async findByIdAndDelete({ id, options, }) {
        return this.model.findByIdAndDelete(id, options);
    }
    async findOneAndDelete({ filter, options, }) {
        return this.model.findOneAndDelete(filter, options);
    }
    async paginate({ page, limit, sort, search, }) {
        page = +page || 1;
        limit = +limit || 10;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 10;
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
exports.default = BaseRepository;
