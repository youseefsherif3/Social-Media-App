//* Import the types for Express request, response, and next function , elc
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/global_error_handling";

//* Authorization middleware function that checks if the authenticated user has the required role to access a specific resource or perform certain actions
export const authorization = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const request = req as any;

    if (!requiredRole.includes(request.user.role)) {
      throw new AppError(
        "Forbidden access, you don't have permission to access this resource",
        403,
      );
    }
    next();
  };
};
