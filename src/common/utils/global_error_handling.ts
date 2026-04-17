//* Import the types for Express request, response, and next function
import type { NextFunction, Request, Response } from "express";

//* Custom error class to handle application-specific errors
export class AppError extends Error {
  constructor(
    public message: any,
    public statusCode: number = 500,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

//* Global error handling middleware function
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = (err.statusCode as number) || 500;
  res.status(statusCode).json({
    message: err.message,
    status: statusCode,
    stack: err.stack,
  });
};

