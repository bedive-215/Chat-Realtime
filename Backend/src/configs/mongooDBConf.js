import mongoose from "mongoose";
import { MONGODB_URL } from "../helpers/env.helper.js";


export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};