//* Importing necessary modules and initializing the Express application
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { PORT } from "./config/config.service";
import {
  AppError,
  globalErrorHandler,
} from "./common/utils/global_error_handling";
import authRouter from "./modules/auth/auth.controller";
import { connectDB } from "./DB/connectionDB";
import redisService from "./common/service/redis.service";

//* Setting up application and port
const app: express.Application = express();
const port: number = PORT;

const bootstrap = () => {
  //* Configuring rate limiting to prevent abuse and protect the server from excessive requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
    handler: (req: Request, res: Response, next: NextFunction) => {
      throw new AppError(
        "Too many requests from this IP, please try again after 15 minutes",
        429,
      );
    },
    legacyHeaders: false,
  });

  //* Using middleware for JSON parsing, CORS, security headers, and rate limiting
  app.use(express.json());
  app.use(limiter, cors(), helmet());

  //* Basic route for testing the server
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Welcome to the Social Media App API" });
  });

  //* The Connection to the database
  connectDB();

  //* The Connection to the Redis server
  redisService.connect();

  //* Using the auth router for handling authentication-related routes
  app.use("/auth", authRouter);

  //* Invalid route handling
  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(
      `Can't find ${req.originalUrl} on this server! , please check the URL and try again.`,
      404,
    );
  });

  //* Global error handling
  app.use(globalErrorHandler);

  //* Starting the server and listening on the specified port
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default bootstrap;
