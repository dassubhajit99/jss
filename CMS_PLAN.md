# JSS Website — CMS Phase: Implementation Plan

> **Audience:** implementing agent/developer. Follow top-to-bottom. Phase 1 (public site) is DONE and deployed-shape: this plan only **activates the stubbed admin/auth surface** on the server and adds a **protected `/admin` area inside the existing `client/` app**. Everything here was verified against the actual code (file paths and shapes below are real, not aspirational).

---

## 0. TL;DR / Locked decisions (do not re-litigate)

| Topic | Decision |
|---|---|
| CMS location | Protected `/admin/*` route tree **inside `client/`** (lazy-loaded). Public routes/Layout untouched; separate `AdminLayout`. |
| Auth | `POST /api/auth/login` → JWT (signed with existing `JWT_SECRET`), Bearer header. Real `authMiddleware` + `requireRole` replace the 501 stubs in `server/src/middleware/auth.js`. No public signup. |
| Admin accounts | Seeded via `npm run create-admin` script (`server/src/scripts/create-admin.js`), bcrypt-hashed passwords. |
| Images | **Cloudinary**, signed **direct-from-browser** upload (server only signs). DB keeps storing plain URL strings — **zero schema changes**. |
| Rich text | **TipTap** in the CMS producing HTML → server sanitizes with the existing `sanitize-html` config on save → `Page.bodyHtml`. |
| Response shape | Keep existing conventions: success `{ data: ... }`, error `{ error: { message, code } }` (see `server/src/middleware/errorHandler.js`). |

### What already exists (verified)
- `server/src/routes/admin.routes.js` — loop-generated 501 stubs for `pages, committee, durga-puja, gallery, services, press, settings, enquiries` behind `authMiddleware`.
- `server/src/routes/auth.routes.js` — `POST /login` 501 stub.
- `server/src/middleware/auth.js` — `authMiddleware` + `requireRole` stubs (both currently throw 501).
- `server/src/models/User.js` — `{ email, passwordHash, name, role: ["admin","editor"], status: ["active","disabled"] }`.
- `server/src/config/env.js` — already reads `JWT_SECRET` (defaults `""`).
- `server/src/middleware/validate.js` — `validateBody(zodSchema)` helper.
- `server/src/seed/seed.js` — `marked` + `sanitize-html` config to reuse for TipTap output.
- `client/src/lib/api.js` — `api(path, opts)` + `getData(path)`; `client/src/hooks/useFetch.js`.
- `client/src/App.jsx` — `<SettingsProvider><Layout><Routes>…` (needs restructuring so admin routes are NOT inside the public `Layout`).
- Vite dev proxy `/api → http://localhost:5000` already configured in `client/vite.config.js`.

---

## 1. What stays unchanged

- **All public routes, pages, components** in `client/src` (Header, Footer, gallery, forms, `SettingsContext`). Public visitors never load admin code (lazy import).
- **All Mongoose schemas** in `server/src/models/` — no field changes anywhere (images are already URL strings; `User` already has everything needed).
- **`server/src/config/db.js`** serverless connection caching, `app.js` middleware order, Vercel entry (`server/api/index.js`, `vercel.json`).
- **Public controller** `server/src/controllers/public.controller.js` and its `status: "published"` filtering.
- **Seed script** behavior (only refactor: extract the sanitize config into a shared util, see §4.4).

---

## 2. New dependencies

### server/ (`cd server && npm i jsonwebtoken bcryptjs cloudinary`)
| Package | Why |
|---|---|
| `jsonwebtoken` | Sign/verify JWTs for admin sessions. |
| `bcryptjs` | bcrypt password hashing. **Pure-JS implementation of the bcrypt algorithm** — chosen over native `bcrypt` to avoid node-gyp/native binary issues on Vercel serverless. API-compatible (`hash`, `compare`). |
| `cloudinary` | Only for `cloudinary.utils.api_sign_request` (upload signatures). No image bytes flow through the server. |

No new server devDependencies.

### client/ (`cd client && npm i @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`)
| Package | Why |
|---|---|
| `@tiptap/react` | React bindings (`useEditor`, `EditorContent`). |
| `@tiptap/pm` | ProseMirror peer package (required by TipTap v2). |
| `@tiptap/starter-kit` | Paragraph, headings, bold, italic, lists, blockquote, history, etc. |
| `@tiptap/extension-link` | Link toolbar button (not in starter-kit). |
| `@tiptap/extension-placeholder` | "Write the page content…" placeholder in the editor. |

Everything else (tables, toasts, dialogs, uploads) is hand-rolled with Tailwind — no UI library, no upload widget dependency (plain `fetch` + `FormData` to Cloudinary).

---

## 3. Environment variables

### server/.env (and Vercel project settings)
```
# existing: MONGODB_URI, MONGODB_DB, PORT, NODE_ENV, CLIENT_ORIGINS

JWT_SECRET=<long random string, e.g. `openssl rand -hex 32`>   # REQUIRED now
JWT_EXPIRES_IN=15d                                             # optional, default "15d"

CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>              # server-only, never sent to browser
CLOUDINARY_FOLDER=jss                                          # optional, default "jss"

# used only by `npm run create-admin` if CLI args are omitted
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

**Update `server/.env.example`:** replace the commented `# [CMS-later] JWT_SECRET=change-me` block with the real entries above (placeholder values, comments explaining each).

### client/.env
No new vars. `VITE_API_BASE_URL` already exists; Cloudinary cloud name + API key are returned by the sign endpoint at runtime, so nothing Cloudinary-related is baked into the client build. Leave `client/.env.example` as is.

**Update `server/src/config/env.js`:** add to the exported `env` object:
```js
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15d",
CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "jss",
```
and a startup warning (like the existing `MONGODB_URI` one) when `JWT_SECRET` is empty.

---

## 4. Backend activation

### 4.0 File additions/changes (server)

```
server/
  package.json                          # + deps, + "create-admin" script
  .env.example                          # + §3 vars
  src/
    config/env.js                       # MODIFY (§3)
    middleware/auth.js                  # REWRITE: real authMiddleware + requireRole
    middleware/errorHandler.js          # MODIFY: map Mongo E11000 → 409 (§4.5)
    routes/auth.routes.js               # REWRITE: real login + me
    routes/admin.routes.js              # REWRITE: real CRUD wiring (§4.6)
    controllers/auth.controller.js      # NEW
    controllers/admin/
      crud.js                           # NEW — generic CRUD factory
      resources.js                      # NEW — per-resource wiring (model + schemas + hooks)
      settings.controller.js            # NEW — singleton get/update
      enquiries.controller.js           # NEW — list / mark handled / delete
      uploads.controller.js             # NEW — Cloudinary signature
      dashboard.controller.js           # NEW — counts for admin home
    validation/admin.schemas.js         # NEW — zod schemas for every resource
    utils/sanitize.js                   # NEW — extracted sanitize-html config
    scripts/create-admin.js             # NEW
  seed/seed.js                          # MODIFY: import sanitize util instead of inline config
```

### 4.1 Real auth middleware — `server/src/middleware/auth.js` (rewrite)

```js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  res.set("Cache-Control", "no-store");                      // admin/auth responses are never cacheable
  if (!env.JWT_SECRET) throw new ApiError(500, "Server auth is not configured", "AUTH_NOT_CONFIGURED");

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized("Authentication required", "NO_TOKEN");

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);             // throws on bad sig / expiry
  } catch {
    throw ApiError.unauthorized("Invalid or expired token", "BAD_TOKEN");
  }

  const user = await User.findById(payload.sub).select("-passwordHash").lean();
  if (!user || user.status !== "active")
    throw ApiError.unauthorized("Invalid or expired token", "BAD_TOKEN");

  req.user = user;                                           // never contains passwordHash
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return next(new ApiError(403, "Insufficient permissions", "FORBIDDEN"));
  next();
};
```
Notes: stateless (serverless-safe — no session store); DB is already connected by the `/api` middleware in `app.js`; loading the user each request means disabling a user takes effect immediately.

### 4.2 Login + me — `server/src/controllers/auth.controller.js` + `routes/auth.routes.js`

Controller:
```js
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
  res.json({ data: { user: publicUser(req.user) } });        // req.user set by authMiddleware
});
```

Routes (`auth.routes.js`, replaces the 501 stub):
```js
import rateLimit from "express-rate-limit";
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: { message: "Too many login attempts, try again later." } },
});
router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);
```
`GET /api/auth/me` exists so the client can restore a session from a stored token on page load. (Note: `express-rate-limit` is in-memory, i.e. per warm serverless instance on Vercel — imperfect but an acceptable brake; bcrypt cost is the real defense. Do not add a DB-backed limiter now.)

### 4.3 `create-admin` script — `server/src/scripts/create-admin.js`

- Usage: `npm run create-admin -- --email admin@example.com --password 'S3cret!' [--name "Admin"] [--role admin]`
  Falls back to `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars when flags are absent; exits 1 with usage text if neither present.
- Logic: parse args (simple `process.argv` scan, no dep) → validate email regex + password length ≥ 8 → `await connectDB()` → `passwordHash = await bcrypt.hash(password, 12)` → `User.findOneAndUpdate({ email: email.toLowerCase() }, { email, passwordHash, name, role: role || "admin", status: "active" }, { upsert: true, new: true })` → log `Created/updated admin <email> (role)` **without printing the password** → `mongoose.connection.close()` → exit 0.
- `server/package.json` scripts: add `"create-admin": "node src/scripts/create-admin.js"`.

### 4.4 Shared sanitizer — `server/src/utils/sanitize.js`

Extract the config currently inlined in `seed/seed.js` `mdToHtml()`:
```js
import sanitizeHtml from "sanitize-html";
export function sanitizeBodyHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
      a: ["href", "name", "target", "rel"],
    },
  });
}
```
Then in `seed/seed.js`, `mdToHtml` becomes `sanitizeBodyHtml(marked.parse(md, { async: false }))`. The admin Pages controller calls `sanitizeBodyHtml` on every create/update of `bodyHtml` (TipTap already emits HTML, so no markdown step).

### 4.5 Error handler tweak — `server/src/middleware/errorHandler.js`

Before the existing status logic, map duplicate-key errors (e.g. creating a second `DurgaPuja` with the same `year`, or a duplicate `Page.slug`):
```js
if (err?.code === 11000) {
  const field = Object.keys(err.keyPattern || {})[0] || "field";
  err = new ApiError(409, `A record with this ${field} already exists`, "DUPLICATE");
}
```
(import `ApiError`; keep the rest identical.)

### 4.6 Admin CRUD — routes, factory, schemas

#### Route table (replaces the stub loop in `admin.routes.js`)

All routes below: `router.use(authMiddleware, requireRole("admin", "editor"))` at the top of the file. `Cache-Control: no-store` is already set by `authMiddleware`. **Declare `/reorder` routes before `/:id` routes.**

| Method & path | Handler | Notes |
|---|---|---|
| `GET  /api/admin/dashboard` | dashboard | counts per collection + unhandled enquiry count |
| `GET  /api/admin/pages` | crud.list | ALL statuses (drafts included), sort `{ order: 1, slug: 1 }` |
| `GET  /api/admin/pages/:id` | crud.get | by `_id` |
| `POST /api/admin/pages` | crud.create | sanitizes `bodyHtml` (pre-hook) |
| `PUT  /api/admin/pages/:id` | crud.update | sanitizes `bodyHtml` |
| `DELETE /api/admin/pages/:id` | crud.remove | |
| `POST /api/admin/pages/reorder` | crud.reorder | body `{ ids: [...] }` → `order = index` |
| — same 6 endpoints for → | `committee` (`CommitteeMember`), `gallery` (`GalleryAlbum`), `services` (`Service`) | all have `order` → include reorder |
| — same minus reorder for → | `durga-puja` (`DurgaPuja`, sort `{ year: -1 }`), `press` (`PressItem`, sort `{ date: -1 }`) | no `order` field |
| `GET  /api/admin/settings` | settings.get | returns singleton (or `{}`) |
| `PUT  /api/admin/settings` | settings.update | `requireRole("admin")`; upsert `{ key: "global" }`; `key` stripped from body |
| `GET  /api/admin/enquiries` | enquiries.list | `?handled=true|false&page=1&limit=20`, sort `{ createdAt: -1 }`, returns `{ data, meta: { total, page, pages } }` |
| `PATCH /api/admin/enquiries/:id` | enquiries.setHandled | body `{ handled: boolean }` |
| `DELETE /api/admin/enquiries/:id` | enquiries.remove | `requireRole("admin")` |
| `POST /api/admin/uploads/sign` | uploads.sign | §4.7 |

There are **no public POST/PUT routes** for content; enquiry creation stays public-only (`POST /api/enquiries`) and enquiries are **not creatable/editable** via admin (list + handled-flag + delete only).

#### CRUD factory — `server/src/controllers/admin/crud.js`

One factory keeps 6 resources DRY. Signature:
```js
export function makeCrud(Model, {
  createSchema, updateSchema,          // zod schemas from validation/admin.schemas.js
  sort = { order: 1, createdAt: -1 },
  beforeSave,                          // optional async (data) => data  (e.g. sanitize bodyHtml)
}) { return { list, get, create, update, remove, reorder }; }
```
Behavior (each wrapped in `asyncHandler`):
- `list`: `Model.find({}).sort(sort).lean()` → `{ data }` (no status filter — admin sees drafts). Collections are small (< a few hundred docs); no pagination needed except enquiries.
- `get`: `findById(req.params.id).lean()`, 404 via `ApiError.notFound`.
- `create`: `validateBody(createSchema)` runs in the route; handler applies `beforeSave`, `Model.create`, respond `201 { data }`.
- `update`: `findByIdAndUpdate(id, data, { new: true, runValidators: true })`, 404 if missing.
- `remove`: `findByIdAndDelete`, 404 if missing, respond `{ data: { deleted: true } }`.
- `reorder`: body validated by shared `reorderSchema = z.object({ ids: z.array(z.string().regex(/^[0-9a-f]{24}$/)).min(1) })`; `Model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { order: i } } })))` → `{ data: { ok: true } }`.

#### Resource wiring — `server/src/controllers/admin/resources.js`

Exports ready-made cruds:
```js
export const pagesCrud     = makeCrud(Page,            { createSchema: pageCreate, updateSchema: pageUpdate,
                                                         sort: { order: 1, slug: 1 },
                                                         beforeSave: (d) => (d.bodyHtml !== undefined
                                                           ? { ...d, bodyHtml: sanitizeBodyHtml(d.bodyHtml) } : d) });
export const committeeCrud = makeCrud(CommitteeMember, { ..., sort: { isExecutive: 1, order: 1 } });
export const durgaPujaCrud = makeCrud(DurgaPuja,       { ..., sort: { year: -1 } });
export const galleryCrud   = makeCrud(GalleryAlbum,    { ..., sort: { order: 1, year: -1 } });
export const servicesCrud  = makeCrud(Service,         { ..., sort: { order: 1 } });
export const pressCrud     = makeCrud(PressItem,       { ..., sort: { date: -1 } });
```

#### Zod schemas — `server/src/validation/admin.schemas.js`

Mirror the Mongoose schemas exactly (fields verified against `server/src/models/*.js`). Shared pieces:
```js
const status = z.enum(["draft", "published"]).default("published");
const url = z.string().trim().max(1000).default("");        // image URLs (Cloudinary secure_url or /assets/…)
const oid = z.string().regex(/^[0-9a-f]{24}$/);
```

| Schema | Shape |
|---|---|
| `pageCreate` | `{ slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/), title: z.string().trim().min(1).max(200), subtitle: z.string().trim().max(300).default(""), bodyHtml: z.string().max(200_000).default(""), heroImage: url, seo: z.object({ title: z.string().max(200).default(""), description: z.string().max(400).default(""), ogImage: url }).default({}), order: z.number().int().default(0), status }` |
| `committeeCreate` | `{ name: min(1).max(200), role: min(1).max(120), isExecutive: z.boolean().default(false), order: z.number().int().default(0), photo: url, status }` |
| `durgaPujaCreate` | `{ year: z.number().int().min(1983).max(2100), theme: max(300).default(""), description: z.string().max(20_000).default(""), awards: z.array(z.string().trim().min(1).max(300)).default([]), coverImage: url, images: z.array(url.min? use z.string().trim().min(1)).default([]), status }` |
| `galleryCreate` | `{ slug: same as page slug, title: min(1).max(200), category: z.enum(["activities","durgapuja"]), year: z.number().int().optional().nullable(), coverImage: url, images: z.array(z.object({ full: z.string().trim().min(1), thumb: z.string().trim().default(""), caption: z.string().trim().max(300).default("") })).default([]), order: int().default(0), status }` |
| `serviceCreate` | `{ name: min(1).max(200), description: max(2000).default(""), teachers: z.array(z.string().trim().min(1).max(200)).default([]), phones: z.array(z.string().trim().min(1).max(40)).default([]), email: z.string().trim().email().max(200).or(z.literal("")).default(""), order: int().default(0), status }` |
| `pressCreate` | `{ title: min(1).max(300), publication: max(200).default(""), date: z.coerce.date().optional().nullable(), excerpt: max(1000).default(""), link: url, image: url, status }` |
| `settingsUpdate` | `{ clubName, tagline, foundedYear: int(), address, email, website, socials: z.object({ facebook, instagram, youtube }).default({}), hero: z.object({ slides: z.array(z.object({ image, headline, subtext, ctaLabel, ctaHref })).default([]) }).default({ slides: [] }), stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]) }` — all strings trimmed with sensible max lengths; **no `key` field accepted** |
| `enquiryPatch` | `{ handled: z.boolean() }` |
| each `xxxUpdate` | `xxxCreate.partial()` (zod `.partial()`), so PUT accepts sparse bodies |

(Write the pseudo-shorthand above out as real zod code — the shorthand is for brevity here only.)

#### Settings / Enquiries / Dashboard controllers

- `settings.controller.js`: `get` → `SiteSetting.findOne({ key: "global" }).lean()` → `{ data: doc || {} }`; `update` → strip `key`, `SiteSetting.findOneAndUpdate({ key: "global" }, { $set: body }, { new: true, upsert: true })`.
- `enquiries.controller.js`: list with filter/pagination as in the route table; `setHandled` → `findByIdAndUpdate(id, { handled }, { new: true })`; `remove` → `findByIdAndDelete`. Enquiries may include PII — they are returned only on this authed route.
- `dashboard.controller.js`: `Promise.all` of `countDocuments()` for Page/CommitteeMember/DurgaPuja/GalleryAlbum/Service/PressItem/Enquiry plus `Enquiry.countDocuments({ handled: false })` → `{ data: { pages, committee, durgaPuja, gallery, services, press, enquiries, unhandledEnquiries } }`.

### 4.7 Cloudinary — signed direct browser upload

**Recommended approach: server signs, browser uploads directly to Cloudinary.** Justification:
1. Vercel serverless functions have a ~4.5 MB request body cap and the app sets `express.json({ limit: "100kb" })` — proxying photo uploads through the API would require multipart middleware, raising limits, and paying function time for large bodies.
2. Direct upload keeps the API stateless and fast; the secret never leaves the server; the signature is time-boxed (Cloudinary rejects signatures older than 1 hour).

`server/src/controllers/admin/uploads.controller.js`:
```js
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const sign = asyncHandler(async (req, res) => {
  if (!env.CLOUDINARY_API_SECRET) throw new ApiError(500, "Uploads are not configured", "UPLOADS_NOT_CONFIGURED");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = env.CLOUDINARY_FOLDER;                       // do NOT accept arbitrary folder from client
  // IMPORTANT: sign exactly the params the browser will send (minus file/api_key).
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, env.CLOUDINARY_API_SECRET);
  res.json({ data: { timestamp, folder, signature,
    apiKey: env.CLOUDINARY_API_KEY, cloudName: env.CLOUDINARY_CLOUD_NAME } });
});
```
Route: `POST /api/admin/uploads/sign` (authed; no body needed). Browser then does:
```
POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload
FormData: file, api_key, timestamp, folder, signature
→ response.secure_url  (store this string in the DB field)
```
**Pitfall for the implementer:** every extra param added to the FormData (other than `file`/`api_key`/`signature`) must also be included in `api_sign_request`, or Cloudinary returns "Invalid Signature". Keep it to `timestamp` + `folder`.

**Thumbnails:** no schema change — derive via URL transformation. Client helper (§5.3): `thumbUrl(url, w=480)` inserts `c_fill,w_480,h_360,q_auto,f_auto/` after `/upload/`. Used to prefill `images[].thumb` in gallery albums (still editable text).

### 4.8 Backend security checklist (implement all)

- [x-shaped goals] JWT expiry via `JWT_EXPIRES_IN` (default 15d); HS256 default; secret ≥ 32 random bytes.
- bcrypt cost 12; login is constant-message (`Invalid email or password`) for unknown email vs wrong password.
- Login rate-limited (10 / 15 min / IP; `trust proxy` already set so `req.ip` is real behind Vercel).
- `passwordHash` never serialized: `authMiddleware` uses `.select("-passwordHash")`; login returns a hand-built `publicUser`.
- `Cache-Control: no-store` on every `/api/auth/*` and `/api/admin/*` response (set in `authMiddleware` + login handler) — admin data must never hit shared/CDN caches.
- All admin writes validated with zod via the existing `validateBody`; `bodyHtml` sanitized server-side (never trust editor output).
- CORS: unchanged — the admin UI is served from the same client origin already in `CLIENT_ORIGINS`. (The `cors` package reflects `Access-Control-Request-Headers` on preflight, so the `Authorization` header passes without config changes.)
- Errors keep the existing `{ error: { message, code } }` shape; stack traces still hidden in prod.

---

## 5. Frontend — `/admin` inside `client/`

### 5.0 File additions/changes (client)

```
client/
  package.json                     # + TipTap deps
  src/
    App.jsx                        # MODIFY — route restructure (§5.1)
    lib/api.js                     # MODIFY — attach err.status; merge headers (§5.2)
    admin/                         # NEW — everything below is new
      AdminApp.jsx                 # lazy-loaded admin root: providers + admin <Routes>
      AuthContext.jsx              # token + user state, login/logout
      lib/adminApi.js              # authed fetch wrapper + Cloudinary upload helpers
      components/
        ProtectedRoute.jsx
        AdminLayout.jsx            # sidebar + topbar + <Outlet/>
        Sidebar.jsx
        DataTable.jsx
        FormField.jsx              # Field, Input, Textarea, Select, Checkbox, NumberInput
        StatusField.jsx            # draft/published select + badge
        ImageUpload.jsx            # single image → Cloudinary → url string
        ImagesField.jsx            # multi-image list (add/remove/reorder/caption)
        ArrayField.jsx             # generic list-of-X editor (strings or objects)
        RichTextEditor.jsx         # TipTap
        ConfirmDialog.jsx
        Toast.jsx                  # ToastProvider + useToast()
        SaveBar.jsx                # sticky Save/Cancel + dirty indicator
      hooks/
        useAdminFetch.js           # authed useFetch with refetch()
      pages/
        Login.jsx
        Dashboard.jsx
        PagesList.jsx      PageForm.jsx
        CommitteeList.jsx  CommitteeForm.jsx
        DurgaPujaList.jsx  DurgaPujaForm.jsx
        AlbumsList.jsx     AlbumForm.jsx
        ServicesList.jsx   ServiceForm.jsx
        PressList.jsx      PressForm.jsx
        SettingsForm.jsx
        EnquiriesList.jsx
```

### 5.1 Routing — modify `client/src/App.jsx`

Current shape wraps **all** routes in `SettingsProvider` + public `Layout`. Restructure with nested routes + `Outlet` so admin renders outside the public chrome, and lazy-load the admin bundle:

```jsx
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

function PublicShell() {
  return (
    <SettingsProvider>
      <Layout><Outlet /></Layout>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        {/* ALL existing public <Route>s move here unchanged: /, /about, …, * (NotFound) */}
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
```
`Layout` currently takes `children` — passing `<Outlet />` as its child works with zero changes to `Layout.jsx`. Keep the public `*` NotFound route **inside** `PublicShell` (React Router ranks the explicit `/admin/*` higher, so admin still wins).

`client/src/admin/AdminApp.jsx` owns the admin subtree (paths below are relative to `/admin`):
```jsx
<AuthProvider>
  <ToastProvider>
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/new" element={<PageForm />} />
        <Route path="pages/:id" element={<PageForm />} />
        {/* committee, durga-puja, gallery, services, press: same list/new/:id trio */}
        <Route path="settings" element={<SettingsForm />} />
        <Route path="enquiries" element={<EnquiriesList />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  </ToastProvider>
</AuthProvider>
```

### 5.2 Auth plumbing

**`client/src/lib/api.js` (modify, backward-compatible):**
1. Attach status to thrown errors: `const err = new Error(msg); err.status = res.status; throw err;`
2. Fix header merging so callers can add headers without losing `Content-Type`:
   `headers: { "Content-Type": "application/json", ...(opts.headers || {}) }, ...rest` (destructure `const { headers, ...rest } = opts`). *(Today `...opts` after `headers:` silently replaces the whole headers object.)*

**`client/src/admin/AuthContext.jsx`:**
- State: `{ token, user, ready }`. Token persisted under localStorage key `"jss_admin_token"` and mirrored in state (memory) — reads go through state, localStorage is only hydration/persistence.
- On mount: if a stored token exists → `GET /auth/me` with it; success → set user; 401 → clear token. Set `ready: true` either way (ProtectedRoute waits for `ready` to avoid a login flash).
- `login(email, password)` → `POST /auth/login` → store token + user.
- `logout()` → clear state + localStorage → navigate `/admin/login`.
- Export `useAuth()`.

**`client/src/admin/lib/adminApi.js`:**
```js
adminApi(path, opts)   // wraps api(): injects Authorization: `Bearer ${token}`;
                       // catches err.status === 401 → forceLogout() → redirect /admin/login
adminGet(path)         // unwraps { data }
adminSend(method, path, body)  // JSON body helper for POST/PUT/PATCH/DELETE
uploadImage(file, { onProgress? })  // §5.3
thumbUrl(url, w=480)   // Cloudinary transform inject; returns url unchanged if not a cloudinary URL
```
Token access: keep a module-level `getToken`/`onUnauthorized` registered by `AuthProvider` (avoids prop-drilling and lets non-hook code use it).

**`ProtectedRoute.jsx`:** `const { token, ready } = useAuth();` → `!ready` → spinner; `!token` → `<Navigate to="/admin/login" replace state={{ from: location }} />`; else render children. `Login.jsx` redirects back to `state.from ?? "/admin"` after success.

### 5.3 Upload helper — `uploadImage(file)` in `adminApi.js`

1. `const sig = await adminGet("/admin/uploads/sign")` → `{ timestamp, folder, signature, apiKey, cloudName }`.
2. Build `FormData`: `file`, `api_key: sig.apiKey`, `timestamp`, `folder`, `signature`.
3. `fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body })` — **no** Content-Type header (browser sets multipart boundary).
4. Return `json.secure_url`; throw with Cloudinary's `error.message` on failure.
5. Client-side guardrails before upload: accept `image/*` only, reject files > 10 MB with a toast.

### 5.4 AdminLayout — visually distinct admin console

- Reuse the existing Tailwind tokens (`maroon/gold/cream/ink` from `client/tailwind.config.js`) but invert the mood so it's unmistakably not the public site: **dark sidebar** (`bg-ink text-cream`, gold accent for the active item), light `bg-cream` content area, compact `font-sans` UI (no Playfair display headings), density-first spacing.
- Structure: fixed left sidebar (w-60) at `lg+`; below `lg` a top bar with hamburger toggling the sidebar as an overlay drawer. Content: `<main className="flex-1 p-4 md:p-8"><Outlet/></main>`.
- Sidebar nav (order fixed): Dashboard `/admin` · Pages `/admin/pages` · Committee `/admin/committee` · Durga Puja `/admin/durga-puja` · Gallery `/admin/gallery` · Services `/admin/services` · Press `/admin/press` · Site Settings `/admin/settings` · Enquiries `/admin/enquiries` (with unhandled-count badge from dashboard data) — then a divider, the signed-in email, "View site" (link to `/`, target _blank), and **Logout**.
- Use `NavLink` with `aria-current`; active style `bg-maroon text-white` or gold left-border.

### 5.5 Reusable admin components (spec)

| Component | Contract |
|---|---|
| `DataTable` | Props: `columns: [{ key, label, render?(row), className? }]`, `rows`, `rowKey`, `onRowClick?`, `empty` text. Renders a `<table>` inside `overflow-x-auto`; on mobile it can stay a scrollable table (acceptable for admin). |
| `FormField` exports | `Field({label, hint, error, children})` wrapper + `Input`, `Textarea`, `Select`, `Checkbox`, `NumberInput` (all controlled, Tailwind-styled via `@tailwindcss/forms` already installed). |
| `StatusField` | Select draft/published + `StatusBadge` (gold badge for draft, green/maroon for published) used in tables. |
| `ImageUpload` | Props: `value` (url string), `onChange(url)`, `label`. Shows preview (`h-32 object-cover rounded`), Upload button (hidden file input) with busy state, Remove button (`onChange("")`), and a small read-only URL text. Uses `uploadImage`. |
| `ImagesField` | For `DurgaPuja.images` (strings) — mode `"strings"` — and `GalleryAlbum.images` (objects `{full, thumb, caption}`) — mode `"objects"`. Grid of rows: thumb preview, caption input (objects mode), ↑ ↓ move buttons, remove. "Add images" button accepts multiple files, uploads sequentially (progress `i/n` text), appends `{ full: secureUrl, thumb: thumbUrl(secureUrl), caption: "" }` or the plain string. Reorder = array order (persisted by saving the doc; no separate endpoint). |
| `ArrayField` | Generic: `value`, `onChange`, `renderRow(item, update)` or default text-input row, `newItem()` factory, add/remove/move. Reused for: `awards` (strings), `teachers`, `phones` (strings), `stats` (`{label, value}`), `hero.slides` (`{image (ImageUpload), headline, subtext, ctaLabel, ctaHref}`). |
| `RichTextEditor` | §5.6. |
| `ConfirmDialog` | Controlled `{ open, title, message, confirmLabel="Delete", onConfirm, onClose }`; focus-trapped modal; used by every delete. |
| `Toast` | `ToastProvider` + `useToast()` → `toast.success(msg)/toast.error(msg)`; fixed bottom-right stack, auto-dismiss 4s. |
| `SaveBar` | Sticky bottom bar inside forms: Save (busy state), Cancel (navigate back); shows validation/save errors. |
| `useAdminFetch(path)` | Same contract as existing `useFetch` (`{data, loading, error}`) but via `adminApi` and returning `refetch()`. Lists call `refetch()` after delete/reorder. |

Form state: plain `useState` object per form + controlled inputs — do **not** add react-hook-form; forms are modest.

### 5.6 RichTextEditor (TipTap)

```jsx
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder: "Write the page content…" }),
  ],
  content: value,                       // initial HTML from Page.bodyHtml
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```
- Toolbar buttons (small icon/text buttons with `editor.isActive(...)` highlight): **H2, H3, Bold, Italic, Bullet list, Ordered list, Blockquote, Link (prompt for URL / unset), Undo, Redo**.
- Editor body styled with the existing typography plugin: wrapper `className="prose max-w-none min-h-[300px] rounded-xl border border-cream-200 bg-white p-4 focus:outline-none"` — matches how the public site renders `bodyHtml`.
- Guard: `useEffect` to `editor.commands.setContent(value)` only when the record loads (compare against `editor.getHTML()` to avoid caret jumps).
- Output is HTML; the server sanitizes on save (§4.4) — the client does not sanitize.

### 5.7 Screens per resource (fields verified against the Mongoose models)

Every list screen: "New" button (top right), `DataTable`, delete via `ConfirmDialog` → `DELETE` → toast → `refetch()`. Every form screen: loads by `:id` (skip fetch on `/new`), `SaveBar`, on save `POST`/`PUT` → toast → navigate to list. Number-`order` fields also editable directly in forms; list screens for committee/services/gallery add ↑↓ reorder buttons calling `POST /{resource}/reorder` with the full id array.

| Screen | List columns | Form fields |
|---|---|---|
| **Dashboard** | — | Count cards (from `/admin/dashboard`) linking to each section; highlight "N unhandled enquiries". |
| **Pages** | title, slug, status, updatedAt | `slug` (Input — **disabled when editing**; public routes are hard-wired to seeded slugs), `title`, `subtitle`, `heroImage` (ImageUpload), `bodyHtml` (**RichTextEditor**), `seo.title`, `seo.description`, `seo.ogImage` (ImageUpload), `order` (NumberInput), `status`. |
| **Committee** | order/↑↓, name, role, isExecutive (badge), status | `name`, `role`, `isExecutive` (Checkbox), `photo` (ImageUpload), `order`, `status`. |
| **Durga Puja** | year, theme, awards count, images count, status | `year` (NumberInput, required; server 409s duplicates), `theme`, `description` (Textarea — plain text, matches public rendering), `awards` (ArrayField strings), `coverImage` (ImageUpload), `images` (ImagesField strings mode), `status`. |
| **Gallery** | order/↑↓, cover thumb, title, category, year, image count, status | `slug` (disabled when editing), `title`, `category` (Select activities/durgapuja), `year` (NumberInput optional), `coverImage` (ImageUpload), `images` (**ImagesField objects mode**: add/remove/reorder, per-image caption, thumb auto-filled via `thumbUrl`), `order`, `status`. |
| **Services** | order/↑↓, name, phones, status | `name`, `description` (Textarea), `teachers` (ArrayField strings), `phones` (ArrayField strings), `email`, `order`, `status`. |
| **Press** | title, publication, date, status | `title`, `publication`, `date` (`<input type="date">`), `excerpt` (Textarea), `link`, `image` (ImageUpload), `status`. |
| **Site Settings** | — (single form, loads `GET /admin/settings`, saves `PUT`) | `clubName`, `tagline`, `foundedYear`, `address` (Textarea), `email`, `website`, `socials.facebook/instagram/youtube`, `hero.slides` (ArrayField object rows: image via ImageUpload + headline/subtext/ctaLabel/ctaHref), `stats` (ArrayField `{label, value}`). |
| **Enquiries** | createdAt, type (badge), name, email/phone, subject, handled toggle | **Read-only management**: row expands (or modal) to show full message + address fields + meta; "Mark handled/unhandled" (PATCH), Delete (admin role); filter tabs All / Unhandled / Handled (`?handled=`), pagination Prev/Next from `meta`. No create/edit. |
| **Login** | — | Centered card on `bg-cream`: club wordmark, email, password, submit with busy state; error toast/text on 401 ("Invalid email or password"); already-authed users visiting `/admin/login` are redirected to `/admin`. |

---

## 6. Build order (checklist for the implementer)

Work in this exact order; each phase ends with a verifiable state.

**Phase C1 — Backend auth (server runnable throughout)**
- [ ] `cd server && npm i jsonwebtoken bcryptjs cloudinary`
- [ ] Update `src/config/env.js` (§3) + `.env.example`; generate a real `JWT_SECRET` into local `.env` (`openssl rand -hex 32`).
- [ ] `src/utils/sanitize.js` + refactor `seed/seed.js` to use it (run `npm run seed -- --fresh` once to confirm no regression).
- [ ] `src/scripts/create-admin.js` + `"create-admin"` npm script; run it, verify the `users` collection doc (hash starts `$2`).
- [ ] Rewrite `src/middleware/auth.js` (§4.1); rewrite `auth.routes.js` + new `controllers/auth.controller.js` (§4.2).
- [ ] Smoke test:
  ```bash
  curl -s localhost:5000/api/auth/login -H 'content-type: application/json' \
       -d '{"email":"admin@example.com","password":"..."}'          # → { data: { token, user } }
  curl -s localhost:5000/api/auth/me -H "authorization: Bearer $TOKEN" # → { data: { user } } ; no passwordHash
  curl -s localhost:5000/api/admin/pages                              # → 401 NO_TOKEN (was 501)
  ```

**Phase C2 — Admin CRUD backend**
- [ ] `src/validation/admin.schemas.js` (§4.6 table).
- [ ] `src/controllers/admin/crud.js` factory + `resources.js`.
- [ ] `settings.controller.js`, `enquiries.controller.js`, `dashboard.controller.js`.
- [ ] Rewrite `src/routes/admin.routes.js` per the route table (reorder routes before `/:id`; `requireRole("admin")` on settings PUT + enquiry DELETE).
- [ ] `errorHandler.js` E11000 → 409 (§4.5).
- [ ] Smoke test with the token: list pages (drafts visible), create/update/delete a test committee member, reorder, PUT settings, list enquiries, PATCH handled. Verify `Cache-Control: no-store` on responses and that a `bodyHtml` containing `<script>alert(1)</script>` comes back sanitized.

**Phase C3 — Cloudinary**
- [ ] Cloudinary account/keys into `server/.env`; `uploads.controller.js` + `POST /api/admin/uploads/sign` route.
- [ ] Verify: `curl -s -X POST .../api/admin/uploads/sign -H "authorization: Bearer $TOKEN"` returns `{ timestamp, folder, signature, apiKey, cloudName }`; then a scripted `curl -F` upload to Cloudinary with those values succeeds and returns `secure_url`.

**Phase C4 — Frontend shell + login**
- [ ] `cd client && npm i @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`
- [ ] Modify `src/lib/api.js` (err.status + header merge, §5.2) — re-run the public site to confirm nothing broke.
- [ ] Restructure `App.jsx` (§5.1) with `PublicShell` + lazy `AdminApp`; verify all public routes still render and `/admin` code-splits (check network tab).
- [ ] `AuthContext.jsx`, `lib/adminApi.js`, `ProtectedRoute.jsx`, `Toast.jsx`, `Login.jsx`, `AdminLayout.jsx` + `Sidebar.jsx`, empty `Dashboard.jsx`.
- [ ] Verify: unauthenticated `/admin` → redirected to `/admin/login`; login works; refresh keeps session (via `/auth/me`); logout returns to login; expired/garbage token in localStorage → clean redirect.

**Phase C5 — Shared admin components**
- [ ] `DataTable`, `FormField` set, `StatusField`, `ConfirmDialog`, `SaveBar`, `ArrayField`, `useAdminFetch`.
- [ ] `ImageUpload` + `uploadImage`/`thumbUrl` helpers (test against real Cloudinary).
- [ ] `ImagesField` (both modes), `RichTextEditor` (§5.6).

**Phase C6 — Resource screens (simplest → hardest)**
- [ ] Dashboard (counts) → Committee → Services → Press → Durga Puja → Pages (TipTap) → Gallery (multi-image) → Site Settings (slides/stats) → Enquiries.
- [ ] After each screen: create/edit/delete round-trip in the browser AND confirm the public page reflects the change (e.g. edit a committee member, reload `/committee`).

**Phase C7 — QA & deploy**
- [ ] Full acceptance pass (§7). Mobile pass on the admin at 390px (sidebar drawer, tables scroll).
- [ ] Add `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_*` env vars to the Vercel **server** project; redeploy; run `npm run create-admin` locally against the Atlas prod URI.
- [ ] Deploy client; verify login + one edit in production; confirm admin API responses have `no-store` and public API unaffected.

---

## 7. Security & acceptance criteria (CMS "done")

**Security (must all hold):**
1. Every `/api/admin/*` route 401s without a valid Bearer token; role checks enforced (editor cannot PUT settings or DELETE enquiries).
2. Login: identical error for bad email vs bad password; rate-limited; bcrypt cost 12; JWT expires (default 15d).
3. `passwordHash` never appears in any API response (grep test on login + `/me` + any admin response).
4. `Page.bodyHtml` is sanitized server-side on every admin write (script-tag injection test passes).
5. Admin/auth responses carry `Cache-Control: no-store`.
6. `CLOUDINARY_API_SECRET` never reaches the browser; sign endpoint is authed; folder is server-controlled.
7. No schema or public-endpoint changes; public API still filters `status: "published"`.

**Functional acceptance:**
1. `npm run create-admin -- --email x --password y` creates a working admin; no signup surface exists anywhere.
2. Admin can CRUD every collection (Pages, Committee, Durga Puja, Gallery, Services, Press), toggle draft/published, and see drafts in admin lists while the public site hides them.
3. Gallery album editing: upload multiple images to Cloudinary, reorder, caption, remove; thumbs auto-derived; public album page renders them.
4. Site Settings form edits hero slides (with image upload) and stats; homepage reflects changes on reload.
5. Pages edited in TipTap render correctly through the public `prose` styling.
6. Enquiries submitted from the public contact form appear in the admin list; can be marked handled and deleted; pagination and handled-filter work.
7. Session survives refresh; 401 (expiry) anywhere in the admin cleanly logs out and redirects to `/admin/login`.
8. Public bundle: admin code is a separate lazy chunk; public pages neither fetch admin code nor break (verify `/`, `/gallery/:slug`, `/contact` post-change).

---

## 8. Risks / double-checks for the implementer

- **Route ordering:** `POST /{resource}/reorder` must be declared before parametrized `/:id` handlers in `admin.routes.js` (Express matches in order).
- **Cloudinary signature mismatch** is the most common failure: the FormData param set must exactly equal the signed param set (§4.7 pitfall note).
- **`api.js` header spread bug:** the current `{ headers: {...}, ...opts }` order means any caller-supplied `headers` object replaces `Content-Type`. Fix per §5.2 before building `adminApi` on top.
- **TipTap version pinning:** install matching v2 versions of all `@tiptap/*` packages (mismatched minor versions of `@tiptap/pm` cause runtime errors).
- **Slug edits:** public routes hard-code page slugs (`/about` → `pages/about` etc.) — keep slug read-only on edit forms; only new pages choose a slug.
- **Rate limiter on serverless** is per-warm-instance (in-memory). Accepted for this scale; do not attempt a DB-backed limiter now.
- **`localStorage` JWT** is an accepted, locked trade-off (XSS surface is small: no third-party scripts, sanitized content). Keep expiry modest (15d) as compensating control.
- **Seed refactor regression:** after extracting `sanitize.js`, re-run the seed against a dev DB before moving on (Phase C1 step).
