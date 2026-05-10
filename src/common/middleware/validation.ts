//* Importing necessary modules and types
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/global_error_handling";

//* Validation middleware function that takes a schema as an argument and returns a middleware function
type requestTypes = keyof Request;
type ValidationSchema = Partial<Record<requestTypes, ZodType>>;

//* Validation middleware function that takes a schema as an argument and returns a middleware function
export const validation = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationError = [];
    for (const key of Object.keys(schema) as requestTypes[]) {
      //* If the schema does not have a validation rule for the current request type, skip to the next iteration
      if (!schema[key]) continue;

      //* If the request contains a file or files, add them to the request body so that they can be validated by the schema
      if (req.file) {
        req.body.attachment = req.file;
      }

      if (req.files) {
        req.body.attachments = req.files;
      }

      //* Validate the request data against the schema and if there are any validation errors, add them to the validationError array
      const result = schema[key].safeParse(req[key]);
      if (!result.success) {
        validationError.push(result.error.message);
      }
    }

    //* If there are any validation errors, throw an AppError with the validation errors and a status code of 400 (Bad Request)
    if (validationError.length > 0) {
      throw new AppError(JSON.parse(validationError as unknown as string), 400);
    }
    next();
  };
};
