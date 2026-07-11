import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { dashboard } from "../controllers/admin/dashboard.controller.js";
import {
  pagesCrud,
  committeeCrud,
  durgaPujaCrud,
  galleryCrud,
  servicesCrud,
  pressCrud,
} from "../controllers/admin/resources.js";
import * as settingsController from "../controllers/admin/settings.controller.js";
import * as enquiriesController from "../controllers/admin/enquiries.controller.js";
import { sign } from "../controllers/admin/uploads.controller.js";
import {
  pageCreate,
  pageUpdate,
  committeeCreate,
  committeeUpdate,
  durgaPujaCreate,
  durgaPujaUpdate,
  galleryCreate,
  galleryUpdate,
  serviceCreate,
  serviceUpdate,
  pressCreate,
  pressUpdate,
  settingsUpdate,
  enquiryPatch,
  reorderSchema,
} from "../validation/admin.schemas.js";

const router = Router();

router.use(authMiddleware, requireRole("admin", "editor"));

router.get("/dashboard", dashboard);

// Helper to wire the standard 6-endpoint CRUD trio (+ optional reorder) for a
// resource, keeping route ordering correct (reorder before /:id).
function wireCrud(path, crud, { createSchema, updateSchema, reorder = true }) {
  if (reorder) {
    router.post(`/${path}/reorder`, validateBody(reorderSchema), crud.reorder);
  }
  router.get(`/${path}`, crud.list);
  router.get(`/${path}/:id`, crud.get);
  router.post(`/${path}`, validateBody(createSchema), crud.create);
  router.put(`/${path}/:id`, validateBody(updateSchema), crud.update);
  router.delete(`/${path}/:id`, crud.remove);
}

wireCrud("pages", pagesCrud, { createSchema: pageCreate, updateSchema: pageUpdate });
wireCrud("committee", committeeCrud, { createSchema: committeeCreate, updateSchema: committeeUpdate });
wireCrud("gallery", galleryCrud, { createSchema: galleryCreate, updateSchema: galleryUpdate });
wireCrud("services", servicesCrud, { createSchema: serviceCreate, updateSchema: serviceUpdate });
wireCrud("durga-puja", durgaPujaCrud, {
  createSchema: durgaPujaCreate,
  updateSchema: durgaPujaUpdate,
  reorder: false,
});
wireCrud("press", pressCrud, { createSchema: pressCreate, updateSchema: pressUpdate, reorder: false });

router.get("/settings", settingsController.get);
router.put("/settings", requireRole("admin"), validateBody(settingsUpdate), settingsController.update);

router.get("/enquiries", enquiriesController.list);
router.patch("/enquiries/:id", validateBody(enquiryPatch), enquiriesController.setHandled);
router.delete("/enquiries/:id", requireRole("admin"), enquiriesController.remove);

router.post("/uploads/sign", sign);

export default router;
