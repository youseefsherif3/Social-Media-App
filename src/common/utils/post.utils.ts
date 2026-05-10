import { AvailabilityEnum } from "../enum/post.enum";


export const AvailabilityPost = (request : any) => {
  return {
    $or: [
      { availability: AvailabilityEnum.public },
      {
        availability: AvailabilityEnum.private,
        createdBy: request?.user?._id,
      },
      {
        availability: AvailabilityEnum.friends,
        createdBy: {
          $in: [...(request?.user?.friends || []), request?.user?._id],
        },
      },
      {
        tags: { $in: [request?.user?._id] },
      },
    ],
  };
};