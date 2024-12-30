import dotenv from "dotenv";

dotenv.config();

export default {
  // General
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,

// Cloudinary
CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}