import mongoose from "mongoose";
import envConfig from "../config/env.config.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envConfig.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
