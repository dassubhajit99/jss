import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const sign = asyncHandler(async (req, res) => {
  if (!env.CLOUDINARY_API_SECRET) throw new ApiError(500, "Uploads are not configured", "UPLOADS_NOT_CONFIGURED");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = env.CLOUDINARY_FOLDER; // do NOT accept arbitrary folder from client
  // IMPORTANT: sign exactly the params the browser will send (minus file/api_key).
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, env.CLOUDINARY_API_SECRET);
  res.json({
    data: {
      timestamp,
      folder,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
    },
  });
});
