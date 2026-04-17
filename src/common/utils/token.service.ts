import jwt from "jsonwebtoken";

//* Utility function to generate a JWT token
export const generateToken = ({
  payload,
  secret_key,
  options,
}: {
  payload: any;
  secret_key: string;
  options?: jwt.SignOptions;
}) => {
  return jwt.sign(payload, secret_key, options);
};

//* Utility function to verify a JWT token
export const verifyToken = ({
  token,
  secret_key,
  options,
}: {
  token: string;
  secret_key: string;
  options?: jwt.VerifyOptions;
}) => {
  return jwt.verify(token, secret_key, options);
};
