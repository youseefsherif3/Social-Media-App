//* Import necessary modules and Types
import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.service";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected To Database Successfully to : ${MONGO_URI}`);
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};
