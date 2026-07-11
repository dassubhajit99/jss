import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB || "jss",
  CLIENT_ORIGINS: (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15d",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "jss",
};

export const isProd = env.NODE_ENV === "production";

if (!env.MONGODB_URI) {
  // Fail fast in dev; on serverless this surfaces on first request.
  console.warn("[env] MONGODB_URI is not set — DB calls will fail.");
}

if (!env.JWT_SECRET) {
  console.warn("[env] JWT_SECRET is not set — auth endpoints will be disabled.");
}
