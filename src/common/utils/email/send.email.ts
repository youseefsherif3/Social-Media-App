//* Importing necessary modules and configurations
import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";

//* Function to send an email using nodemailer with Gmail service and provided mail options
export const sendEmail = async (mailOptions: Mail.Options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `Social Media App <${EMAIL}>`,
    ...mailOptions,
  });

  console.log("Message sent:", info.messageId);

  return info.accepted.length > 0 ? true : false;
};

//* Function to generate a 6-digit One-Time Password (OTP) for verification purposes
export const generateOTP = async () => {
  return Math.floor(100000 + Math.random() * 900000);
};
