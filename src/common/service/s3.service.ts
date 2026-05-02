import { randomUUID } from "crypto";
//* Importing necessary modules and types
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
} from "../../config/config.service";
import { Store_Enum } from "../enum/multer.enum";
import fs from "node:fs";
import { AppError } from "../utils/global_error_handling";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//* Defining the S3Service class to interact with Amazon S3
export class S3Service {
  private client: S3Client;

  //* Initializing the S3 client with the provided AWS credentials and region
  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });
  }

  //* Method to upload a file to S3
  async uploadFile({
    file,
    store_type = Store_Enum.memory,
    path = "General",
    ACL = ObjectCannedACL.private,
  }: {
    file: Express.Multer.File;
    store_type?: Store_Enum;
    ACL?: ObjectCannedACL;
    path?: string;
  }): Promise<string> {
    //* Generating a unique key for the file upload and creating a PutObjectCommand to upload the file to S3
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      ACL,
      Key: `Social_Media_App/${path}/${randomUUID()}__${file.originalname}`, //* Generating a unique key for the file upload
      Body:
        store_type == Store_Enum.memory
          ? file.buffer
          : fs.createReadStream(file.path), //* Using the file buffer for memory storage and creating a read stream for disk storage
      ContentType: file.mimetype,
    });

    if (!command.input.Key) {
      throw new AppError(
        "Failed to generate a unique key for the file upload",
        500,
      );
    }

    //* Sending the command to S3 and returning the key of the uploaded file
    await this.client.send(command);

    //* This return is used to return the key of the uploaded file, which can be used to access the file in S3 later
    return command.input.Key;
  }

  //* Method to upload large files to S3, which can be used for files larger than the default max file size limit
  async uploadLargeFile({
    file,
    store_type = Store_Enum.disk,
    path = "General",
    ACL = ObjectCannedACL.private,
  }: {
    file: Express.Multer.File;
    store_type?: Store_Enum;
    ACL?: ObjectCannedACL;
    path?: string;
  }): Promise<string> {
    //* Generating a unique key for the file upload and creating a PutObjectCommand to upload the file to S3
    const command = new Upload({
      client: this.client,
      params: {
        Bucket: AWS_BUCKET_NAME,
        ACL,
        Key: `Social_Media_App/${path}/${randomUUID()}__${file.originalname}`, //* Generating a unique key for the file upload
        Body:
          store_type == Store_Enum.memory
            ? file.buffer
            : fs.createReadStream(file.path), //* Using the file buffer for memory storage and creating a read stream for disk storage
        ContentType: file.mimetype,
      },
    });

    //* This result is return the key of the uploaded file, which can be used to access the file in S3 later
    const result = await command.done();

    //* Returning the key of the uploaded file
    return result.Key!;
  }

  //* Method to upload multiple files to S3, which can be used for batch uploads or when multiple files need to be uploaded at once
  async uploadFiles({
    files,
    store_type = Store_Enum.memory,
    path = "General",
    ACL = ObjectCannedACL.private,
    isLarge = false,
  }: {
    files: Express.Multer.File[];
    store_type?: Store_Enum;
    ACL?: ObjectCannedACL;
    path?: string;
    isLarge?: boolean;
  }) {
    let urls: string[] = [];

    if (isLarge) {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadLargeFile({ file, store_type, path, ACL });
        }),
      );
    } else {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadLargeFile({ file, store_type, path, ACL });
        }),
      );
    }
  }

  //* Method to create a pre-signed URL for uploading a file to S3, which can be used to allow clients to upload files directly to S3 without going through the server
  async createPreSignedUrl({
    path,
    fileName,
    ContentType,
    expiresIn = 60,
  }: {
    path: string;
    fileName: string;
    ContentType: string;
    expiresIn?: number;
  }) {
    const Key = `Social_Media_App/${path}/${randomUUID()}__${fileName}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
      ContentType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, Key };
  }

  //* Method to get a file from S3 using its key, which can be used to retrieve files from S3 for download or display purposes
  async getFile(Key: string) {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
    });
    return await this.client.send(command);
  }

  //* Method to get a pre-signed URL 
  async getPreSignedUrl({
    Key,
    expiresIn = 60,
  }: {
    Key: string;
    expiresIn?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    return url;
  }

  //* Method to get a list of files in a specific folder in S3
  async getFiles(folderName : string) {

    const command = new ListObjectsV2Command({
      Bucket: AWS_BUCKET_NAME,
      Prefix: `Social_Media_App/${folderName}/`
    })

    return await this.client.send(command);
  }

  //* Method to delete a file from S3 using its key
  async deleteFile(Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
    });

    await this.client.send(command);
  }

}
