//* Importing necessary modules for handling environment variables and file paths
import { resolve } from "path";
import { config } from "dotenv";

//* Retrieving the current Node environment from the environment variables
const NODE_ENV = process.env.NODE_ENV;

//* Configuring environment variables from the .env.development file
config({ path: resolve(__dirname, `../../.env.${NODE_ENV}`) });

//* Exporting the PORT variable from the environment configuration for use in other parts of the application
export const PORT: number = Number(process.env.PORT) || 3000;

//* Exporting the MONGO_URI variable from the environment configuration for use in database connection
export const MONGO_URI: string = process.env.MONGO_URI!;

//* Exporting the SALT_ROUNDS variable from the environment configuration for use in password hashing
export const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS);

//* Exporting the ENCRYPTION_KEY variable from the environment configuration for use in data encryption
export const ENCRYPTION_KEY: string = process.env.ENCRYPTION_KEY!;

//* Exporting the IV_LENGTH variable from the environment configuration for use in AES-256 encryption
export const IV_LENGTH: number = Number(process.env.IV_LENGTH);

//* Exporting the EMAIL variable from the environment configuration for use in sending emails
export const EMAIL: string = process.env.EMAIL!;

//* Exporting the PASSWORD variable from the environment configuration for use in sending emails
export const PASSWORD: string = process.env.PASSWORD!;

//* Exporting the REDIS_URL variable from the environment configuration for use in connecting to the Redis server
export const REDIS_URL: string = process.env.REDIS_URL!;

//* Exporting the TOKEN_SECRET_KEY variable from the environment configuration for use in signing JSON Web Tokens (JWT)
export const TOKEN_SECRET_KEY: string = process.env.TOKEN_SECRET_KEY!;

//* Exporting the REFRESH_TOKEN_SECRET_KEY variable from the environment configuration for use in signing Refresh Tokens
export const REFRESH_TOKEN_SECRET_KEY: string = process.env.REFRESH_TOKEN_SECRET_KEY!;

//* Exporting the WEB_CLIENT_ID variable from the environment configuration for use in Google Sign-In authentication
export const WEB_CLIENT_ID: string = process.env.WEB_CLIENT_ID!;

//* Exporting the AWS access key from the environment configuration for use in AWS SDK authentication
export const AWS_ACCESS_KEY: string = process.env.AWS_ACCESS_KEY!;

//* Exporting the AWS secret key from the environment configuration for use in AWS SDK authentication
export const AWS_SECRET_KEY: string = process.env.AWS_SECRET_KEY!;

//* Exporting the AWS region from the environment configuration for use in AWS SDK configuration
export const AWS_REGION: string = process.env.AWS_REGION!;

//* Exporting the AWS S3 bucket name from the environment configuration for use in AWS S3 operations
export const AWS_BUCKET_NAME: string = process.env.AWS_BUCKET_NAME!;