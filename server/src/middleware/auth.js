import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  res.set("Cache-Control", "no-store"); // admin/auth responses are never cacheable
  if (!env.JWT_SECRET) throw new ApiError(500, "Server auth is not configured", "AUTH_NOT_CONFIGURED");

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized("Authentication required", "NO_TOKEN");

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET); // throws on bad sig / expiry
  } catch {
    throw ApiError.unauthorized("Invalid or expired token", "BAD_TOKEN");
  }

  const user = await User.findById(payload.sub).select("-passwordHash").lean();
  if (!user || user.status !== "active")
    throw ApiError.unauthorized("Invalid or expired token", "BAD_TOKEN");

  req.user = user; // never contains passwordHash
  next();
});

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new ApiError(403, "Insufficient permissions", "FORBIDDEN"));
    next();
  };
