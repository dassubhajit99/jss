import mongoose from "mongoose";
import { env } from "./env.js";

// Serverless-safe connection: cache the connection on `global` so warm
// function invocations reuse it instead of opening a new pool each time
// (important for MongoDB Atlas connection limits on Vercel).
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request
    throw err;
  }
  return cached.conn;
}
