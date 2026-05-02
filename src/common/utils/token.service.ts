//* Importing necessary modules and types
import jwt, {
  JwtPayload,
  Secret,
  SignOptions,
  VerifyOptions,
} from "jsonwebtoken";

//* TokenService class to handle JWT token generation and verification */
class TokenService {
  constructor() {}
  //* Utility function to generate a JWT token
  generateToken = ({
    payload,
    secret_key,
    options,
  }: {
    payload: object;
    secret_key: Secret;
    options?: SignOptions;
  }): string => {
    return jwt.sign(payload, secret_key, options);
  };

  //* Utility function to verify a JWT token
  verifyToken = ({
    token,
    secret_key,
    options,
  }: {
    token: string;
    secret_key: Secret;
    options?: VerifyOptions;
  }): JwtPayload => {
    return jwt.verify(token, secret_key, options) as JwtPayload;
  };
}

export default new TokenService();