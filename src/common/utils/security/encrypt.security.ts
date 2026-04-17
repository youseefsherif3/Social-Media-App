//* Importing the crypto module from Node.js for performing encryption and decryption operations
import crypto from "node:crypto";
import { ENCRYPTION_KEY, IV_LENGTH } from "../../../config/config.service";

//* Creating a Buffer from the encryption key
const key = Buffer.from(ENCRYPTION_KEY);

//* Function to encrypt a given text using AES-256 encryption algorithm
export function EncryptData(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

//* Function to decrypt a given encrypted text using AES-256 decryption algorithm
export function DecryptData(text: string) {
  const [IVHex, encryptedText] = text.split(":");
  const iv = Buffer.from(IVHex!, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText!, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
