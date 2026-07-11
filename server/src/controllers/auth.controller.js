import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

const publicUser = (u) => ({ id: u._id, email: u.email, name: u.name, role: u.role });

export const login = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!env.JWT_SECRET) throw new ApiError(500, "Server auth is not configured", "AUTH_NOT_CONFIGURED");

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), status: "active" });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  // Same message whether the email or the password was wrong — never leak which.
  if (!ok) throw ApiError.unauthorized("Invalid email or password", "BAD_CREDENTIALS");

  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res.json({ data: { token, user: publicUser(user) } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: publicUser(req.user) } }); // req.user set by authMiddleware
});
