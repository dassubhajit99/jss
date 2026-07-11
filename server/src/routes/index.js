import { Router } from "express";
import publicRoutes from "./public.routes.js";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.use("/", publicRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;
