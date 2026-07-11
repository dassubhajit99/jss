import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me, loginSchema } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many login attempts, try again later." } },
});

router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
