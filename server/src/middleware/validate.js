import { ApiError } from "../utils/ApiError.js";

// Validates req.body against a zod schema; replaces body with parsed data.
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return next(ApiError.badRequest(msg, "VALIDATION_ERROR"));
  }
  req.body = result.data;
  next();
};
