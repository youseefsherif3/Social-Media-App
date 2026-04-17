//* Importing necessary modules and types
import { GenderEnum } from "../../common/enum/user.enum";
import * as z from "zod";

//* Validation schema for the Sign-Up API
export const signUpSchema = {
  body: z
    .object({
      userName: z.string().min(3).max(25),
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
      age: z.number().min(13).max(60),
      gender: z.enum(GenderEnum).optional(),
      address: z.string().min(3).max(100).optional(),
      phone: z.string().min(10).max(15).optional(),
    })
    .refine(
      (date) => {
        return date.password === date.confirmPassword;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      },
    ),
};

//* Validation schema for the Email Confirmation API
export const confirmEmailSchema = {
  body: z.object({
    email: z.string().email(),
    OTP: z.string().length(6),
  }),
};

//* Validation schema for the Login API
export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
};

//* Validation schema for the Update Password API
export const updatePasswordSchema = {
  body: z
    .object({
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6),
      confirmNewPassword: z.string().min(6),
    })
    .refine((data) => {
      return data.newPassword === data.confirmNewPassword;
    }, {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    }),
};

//* Validation schema for the Reset Password API
export const resetPasswordSchema = {
  body: z
    .object({
      email: z.string().email(),
      OTP: z.string().length(6),
      newPassword: z.string().min(6),
      confirmNewPassword: z.string().min(6),
    })
    .refine((data) => {
      return data.newPassword === data.confirmNewPassword;
    }, {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    }),
};

export type ISignUpType = z.infer<typeof signUpSchema.body>;
export type IConfirmEmailType = z.infer<typeof confirmEmailSchema.body>;
export type ILoginType = z.infer<typeof loginSchema.body>;
export type IUpdatePasswordType = z.infer<typeof updatePasswordSchema.body>;
export type IResetPasswordType = z.infer<typeof resetPasswordSchema.body>;
