//* Importing necessary modules and types
import { Types } from "mongoose";
import * as z from "zod";

//* General validation rules that can be reused across different modules in the application
export const generalRules = {
  id: z.string().refine(
    (value) => {
      return Types.ObjectId.isValid(value);
    },
    {
      message: "Invalid ID format , Check if the ID is a valid MongoDB ObjectId",
    },
  ),

  file : z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.any().optional(),
    Path: z.string().optional(),
    size: z.number(),
  })
};
