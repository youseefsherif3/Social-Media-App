//* Importing necessary modules for hashing and comparing passwords using bcrypt
import { compareSync, hashSync } from "bcrypt";
import { SALT_ROUNDS } from "../../../config/config.service";

//* Function to hash a plain text password using bcrypt with specified salt rounds
export function HashPassword({
  plainText,
  saltRounds = SALT_ROUNDS,
}: {
  plainText: unknown;
  saltRounds?: number;
}) : string {
  return hashSync(plainText as string, saltRounds);
}

//* Function to compare a plain text password with a hashed password using bcrypt
export function ComparePassword({
  plainText,
  cipherText,
}: {
  plainText: string;
  cipherText: string;
}) : boolean {
  return compareSync(plainText, cipherText);
}
