import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import { env, isProd } from "./config/env.js";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { asyncHandler } from "./utils/asyncHandler.js";

const app = express();

app.set("trust proxy", 1); // correct req.ip behind Vercel/proxies

app.use(helmet());
app.use(compression());

const VERCEL_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const isAllowedOrigin = (origin) =>
  env.CLIENT_ORIGINS.includes(origin) || VERCEL_ORIGIN_RE.test(origin);

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin/non-browser (no origin), configured origins, and any Vercel deployment
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      console.warn("[cors] blocked origin:", origin);
      return cb(null, false);
    },
  })
);
app.use(express.json({ limit: "100kb" }));
if (!isProd) app.use(morgan("tiny"));

// Ensure a DB connection exists before handling API requests (serverless-safe).
app.use(
  "/api",
  asyncHandler(async (req, res, next) => {
    await connectDB();
    next();
  })
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
