import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getSettings,
  getPage,
  getCommittee,
  listDurgaPuja,
  getDurgaPujaYear,
  listGallery,
  getAlbum,
  listServices,
  listPress,
  createEnquiry,
  enquirySchema,
} from "../controllers/public.controller.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const enquiryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many submissions, please try again shortly." } },
});

router.get("/settings", getSettings);
router.get("/pages/:slug", getPage);
router.get("/committee", getCommittee);
router.get("/durga-puja", listDurgaPuja);
router.get("/durga-puja/:year", getDurgaPujaYear);
router.get("/gallery", listGallery);
router.get("/gallery/:slug", getAlbum);
router.get("/services", listServices);
router.get("/press", listPress);

router.post("/enquiries", enquiryLimiter, validateBody(enquirySchema), createEnquiry);

export default router;
