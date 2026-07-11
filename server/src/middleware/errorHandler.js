import { isProd } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    err = new ApiError(409, `A record with this ${field} already exists`, "DUPLICATE");
  }
  const status = err.status || 500;
  const payload = {
    error: {
      message: status === 500 && isProd ? "Internal server error" : err.message,
      code: err.code || undefined,
    },
  };
  if (!isProd && status === 500) payload.error.stack = err.stack;
  if (status >= 500) console.error(err);
  res.status(status).json(payload);
}
