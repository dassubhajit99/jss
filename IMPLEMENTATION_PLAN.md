# Siliguri Jatiya Shakti Sangha (JSS) — Website Rebuild: Implementation Plan

> **Audience:** This document is written for an implementing agent/developer. Follow it top-to-bottom. Every decision, folder, model, route, page, and design token needed for **Phase 1** is specified here. Where something is deferred to the CMS phase, it is explicitly marked **[CMS-later]** and the structure is scaffolded so it drops in without refactoring.

---

## 0. TL;DR / What we are building

We are rebuilding the 1980s-era website of **Siliguri Jatiya Shakti Sangha O Pathagar (JSS)** — a community & cultural club founded in 1983 in Champasari, Siliguri, Darjeeling (West Bengal), famous for its large themed **Durga Puja**, plus sports, social work, a library, and health camps.

- **Frontend:** Vite + React (JavaScript) + Tailwind CSS. **Mobile-first** (most visitors are on phones).
- **Backend:** Express + Node.js, written **serverless-safe** (Vercel functions).
- **Database:** MongoDB + Mongoose (MongoDB Atlas).
- **Architecture:** API-driven from day one. The public site consumes a REST API. A **CMS will be added later** to manage the same content, so the data models and admin routes are scaffolded now.
- **Deploy:** Frontend + Backend on **Vercel** (Cloudflare Pages is an acceptable frontend alternative). DB on MongoDB Atlas.

### Locked product decisions (already approved)
| Topic | Decision |
|---|---|
| Donations | **Removed from scope (2026-07-11).** No donate page, nav entry, donation form, donation settings, or `donation` enquiry type. The home CTA is a membership/contact prompt instead. |
| Contact form | **Save to MongoDB only.** No email provider integration in Phase 1. |
| Design | **Warm heritage** palette: Maroon `#7B1E1E`, Gold `#C99700`, Cream `#FAF6EF`, Ink `#1F1B18`. |
| Hosting | Vercel (FE + BE). Cloudflare Pages acceptable for FE. MongoDB Atlas for DB. |

---

## 1. Source material (already scraped — do not re-scrape)

All source content lives in `./scraped_site/`:

```
scraped_site/
  content/            # Cleaned markdown per page (USE THESE as the content source of truth)
  html/               # Original raw HTML (reference only)
  images/             # 44 images (mix of legacy GIF chrome + reusable photos)
  photogallery/       # 139 gallery photos (paired big/small = full/thumbnail)
  scripts/style.css   # Legacy CSS (reference only — do NOT reuse)
  fancybox/           # Legacy jQuery lightbox (do NOT reuse — replace with React)
  membership-form.pdf # Reusable — ship as a download
  show1.swf           # Dead Flash — DO NOT use. Replace with a React hero slider.
```

**Rules for the assets:**
- **Ignore** all legacy UI chrome: `*-ban.gif`, `*-btn.gif`, `slice_*.jpg`, `more*.gif`, `p-corner.gif`, `panel-theme.jpg`, `add-ban.gif`, and every `.gif`. These are old buttons/banners; we are redesigning.
- **Reuse** real photos: in `images/` → `award-14-*.jpg`, `home-pic*.jpg`, `homepic3.jpg`, `plantation.jpg`, `puja09.jpg`, `member1.jpg`. In `photogallery/` → everything (they are event photos).
- **Flash (`show1.swf`) is dead** — do not attempt to render it. The homepage hero slideshow becomes a React/Tailwind carousel.
- Gallery pairing convention in `photogallery/`: files ending `b`/`-big`/`-b` are **full-size**; `s`/`-small`/`-s` are **thumbnails**. Pair them when seeding albums.

**Content source of truth = `scraped_site/content/*.md`.** The raw markdown has table/whitespace noise from scraping; the seed script (Section 6.6) cleans it. Human-readable content summary per page is in Section 2.

---

## 2. Site content & information architecture

### 2.1 Club facts (for footer, about, SEO)
- **Name:** Jatiya Shakti Sangha O Pathagar (a.k.a. Siliguri JSS)
- **Founded:** 1983 (Silver Jubilee 2007)
- **Location:** Champasari, Siliguri, Darjeeling, West Bengal
- **Email:** info@SiliguriJSS.org
- **Web:** www.SiliguriJSS.org
- **Origin story:** Formed by local youth (Swapan Chakraborty, Dibyendu Sanyal & others) with a Rs. 500 donation; named in memory of a youth who died by electrocution; started on a 4-katha plot on Champasari Main Road; grew into a double-storied club house.

### 2.2 Pages (Phase 1 public site)
| Route | Page | Content source | Type |
|---|---|---|---|
| `/` | **Home** | `index.md` + curated | Composed (hero slider, highlights, CTA) |
| `/about` | **About / Preface (History)** | `preface.md`, `profile.md` | Page doc |
| `/committee` | **Governing Body** | `governing-body.md` | Committee collection |
| `/durga-puja` | **Durga Puja** (year-by-year themes + awards) | `durgapuja.md` | DurgaPuja collection |
| `/sports` | **Sports** | `sports.md` | Page doc |
| `/social` | **Social Activities** | `social-activity.md` | Page doc |
| `/health` | **Health Check-ups** | `health-check-ups.md` | Page doc |
| `/library` | **Library (Pathagar)** | `library.md`, `future-plan.md` | Page doc |
| `/future-plan` | **Future Plans** | `future-plan.md` | Page doc |
| `/gallery` | **Photo Gallery** (Activities + Durga Puja albums) | `glimpses.md`, `durga-puja-glimpses.md`, `photogallery/` | GalleryAlbum collection |
| `/press` | **Press** | `press.md` (placeholder) | PressItem collection (empty now) |
| `/members` | **Members / Membership** | `members.md` + `membership-form.pdf` | Page doc + download |
| `/contact` | **Contact Us** | `contact-us.md` | Page doc + enquiry form |

> Pages marked "This section will be updated very soon" in source (`profile`, `members`, `press`, `library`) get a clean, on-brand **"Coming soon / content being updated"** state — not an error. Their DB docs exist so the CMS can fill them.

### 2.3 Services / Programs (from homepage content — surface on Home + Sports/Contact)
- **Dance School** — Teacher: Debjani Bhattacharjee; Asst: Mousumi Das; ☎ +91 9434496046 / +91 8597027787
- **Kaizen Karate-DO Association** — Debasish Dhali; ☎ +91 9832480087 / +91 8900699807; karateslg@gmail.com
- **JSS Cricket Academy** (with Champasari Cricket Academy) — Committee: Pranab Das, Tapan Bhowal, Mahash Tiwari; ☎ +91 8101787288
- **Ambulance Day & Night Service** (within Siliguri) — ☎ +91 7797638863

### 2.4 Global navigation (mobile-first)
Primary nav (hamburger drawer on mobile, horizontal bar ≥ lg):
`Home · About · Durga Puja · Activities ▸ (Sports, Social, Health, Library) · Gallery · Members · Contact`
- Group Sports/Social/Health/Library under an **"Activities"** dropdown to keep the bar short.
- Footer: club address, email, quick links, service phone numbers, copyright, "Rebuilt 2026".

---

## 3. Architecture & repository layout

**Single repository, two deployable apps** (`client`, `server`) as a lightweight monorepo. No workspace tooling required; each has its own `package.json`.

```
jss/
  IMPLEMENTATION_PLAN.md          # this file
  scraped_site/                   # source assets (kept; not deployed as-is)
  README.md                       # short dev quickstart (create in Phase 0)
  .gitignore                      # node_modules, .env, dist, .vercel

  client/                         # Vite + React + Tailwind (public site; CMS UI later lives here or a sibling)
    public/
      assets/                     # optimized images copied from scraped_site (see 6.7)
      gallery/                    # optimized gallery images (thumbs + full)
      membership-form.pdf
      favicon, og-image, etc.
    src/
      main.jsx
      App.jsx
      router.jsx
      lib/
        api.js                    # fetch wrapper -> VITE_API_BASE_URL
        seo.js                    # <Seo> helper (react-helmet-async)
      components/
        layout/ (Header, Nav, MobileDrawer, Footer, Layout)
        ui/ (Button, Card, Section, Container, Badge, Spinner, EmptyState, Breadcrumb)
        gallery/ (AlbumCard, Lightbox, ImageGrid)
        home/ (HeroSlider, HighlightCards, DurgaPujaTeaser, StatsStrip, CtaBanner)
        forms/ (EnquiryForm)
      pages/                      # one file per route in 2.2
      hooks/ (useFetch.js)
      styles/ (index.css with Tailwind directives)
    index.html
    tailwind.config.js
    postcss.config.js
    vite.config.js
    .env.example                  # VITE_API_BASE_URL=
    package.json

  server/                         # Express API (serverless-safe)
    api/
      index.js                    # Vercel serverless entry -> exports app
    src/
      app.js                      # builds & returns Express app (no app.listen here)
      server.js                   # local dev: imports app, app.listen(PORT)
      config/
        db.js                     # cached Mongoose connection (serverless-safe)
        env.js                    # env validation
      models/                     # Mongoose schemas (Section 5)
      controllers/
      routes/
        index.js                  # mounts /api/... routers
        public.routes.js
        admin.routes.js           # [CMS-later] guarded by authMiddleware stub
        auth.routes.js            # [CMS-later] login stub
      middleware/
        errorHandler.js
        notFound.js
        validate.js               # zod/express-validator wrapper
        auth.js                   # authMiddleware (JWT) — stubbed now
        rateLimit.js
      utils/ (asyncHandler.js, ApiError.js, slugify.js)
      seed/
        seed.js                   # populate DB from scraped_site/content
        data/                     # hand-cleaned JSON derived from scraped md
    vercel.json                   # route all requests to api/index.js
    .env.example
    package.json
```

### 3.1 Key architectural principles
1. **API-driven, CMS-ready from day 1.** The React site never hardcodes editable content; it fetches from the API. The seed script loads the scraped content into MongoDB. When the CMS is built, it writes to the same collections — zero frontend changes.
2. **Serverless-safe backend.** No long-lived `app.listen` in the deployed artifact; export the Express `app` and wrap it for Vercel. **Cache the Mongoose connection on `global`** so functions reuse it across warm invocations (critical for Atlas connection limits).
3. **Separation of read (public) and write (admin).** Public routes are read-only (`GET`) + two form `POST`s (enquiries). All content mutations live under `/api/admin/*` behind `authMiddleware` (stubbed now, real JWT in CMS phase).
4. **Content typing:** free-form editorial pages use a `Page` model with rich HTML/markdown body; strongly-structured data (committee, puja years, gallery, services) use dedicated collections.
5. **Images as URLs.** DB stores image **URL strings**. Phase 1 those point to `/assets/...` bundled in the frontend. CMS phase swaps in uploaded URLs (Cloudinary / Vercel Blob) with no schema change.

---

## 4. Design system (Warm Heritage)

Mobile-first, clean, modern, festive-but-trustworthy. Evokes Durga Puja & Bengali heritage without looking dated.

### 4.1 Design tokens → `tailwind.config.js`
```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: "#7B1E1E", 700: "#651818", 900: "#4A1111" },
        gold:   { DEFAULT: "#C99700", 600: "#A87E00", 300: "#E7C64D" },
        cream:  { DEFAULT: "#FAF6EF", 200: "#F2EADD" },
        ink:    { DEFAULT: "#1F1B18", 700: "#3A332E" },
      },
      fontFamily: {
        // display serif for headings (heritage feel)
        display: ['"Playfair Display"', "serif"],
        // clean sans for body; Bengali-capable fallback for local names
        sans: ['Inter', '"Hind Siliguri"', '"Noto Sans Bengali"', "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 6px 24px -8px rgba(31,27,24,0.18)" },
      maxWidth: { content: "72rem" }, // page container
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
```

### 4.2 Typography & fonts
- Headings: **Playfair Display** (700/800). Body: **Inter**. Bengali fallback: **Hind Siliguri / Noto Sans Bengali** (some names/content are Bengali).
- Load via `<link>` in `index.html` (or self-host for perf). Keep weights minimal.
- Base body text ≥ 16px; generous line-height (`leading-relaxed`) for readability on mobile.
- Use the `prose` plugin (`@tailwindcss/typography`) for rendered page bodies, themed with maroon links & gold accents.

### 4.3 Visual language
- Background: `cream`. Text: `ink`. Primary brand: `maroon`. Accent/CTA: `gold`.
- Buttons: primary = maroon bg/white text; CTA = gold bg/ink text; secondary = outline maroon.
- Cards: white bg, `rounded-2xl`, `shadow-soft`, subtle border `border-cream-200`.
- Section rhythm: `py-12 md:py-20`, container `max-w-content mx-auto px-4 sm:px-6`.
- Motifs (subtle, optional): thin gold divider rules; a small "dhak/alpona"-inspired SVG separator between sections — keep tasteful, do not clutter.
- Imagery: rounded corners, `object-cover`, lazy-loaded.

### 4.4 Mobile-first rules (mandatory)
- Design every component at 360px width first, then enhance at `sm/md/lg`.
- Nav collapses to a hamburger drawer < `lg`. Drawer is full-height, large tap targets (≥ 44px).
- One-column layouts on mobile; grids (`grid-cols-2/3/4`) only at `md+`.
- Sticky, compact header on scroll. Persistent bottom-safe padding.
- Images responsive (`w-full h-auto`, `max-w-full`), served in appropriate sizes; use `loading="lazy"` + `decoding="async"`.
- Test breakpoints: 360, 390, 768, 1024, 1280.
- Lighthouse mobile targets: Perf ≥ 90, Accessibility ≥ 95.

### 4.5 Accessibility
- Semantic HTML, one `<h1>` per page, labeled form fields, focus-visible rings (gold), color contrast ≥ 4.5:1 (verify maroon/gold on cream), `alt` text on all images, keyboard-navigable drawer & lightbox, `aria-current` on active nav.

---

## 5. Data models (Mongoose)

All schemas: `{ timestamps: true }`. Add `status: { type: String, enum: ["draft","published"], default: "published" }` to every content model so the CMS can unpublish. Public API returns only `status: "published"`. Add `slug` (unique, indexed) where addressable.

### 5.1 `Page` — editorial pages
```
{
  slug: String (unique, required),      // "about", "sports", "social", "health",
                                        // "library", "future-plan", "members",
                                        // "contact", "profile", "press"
  title: String (required),
  subtitle: String,
  bodyHtml: String,                     // rendered rich content (from cleaned md)
  heroImage: String (URL),
  seo: { title: String, description: String, ogImage: String },
  order: Number,
  status: enum
}
```

### 5.2 `CommitteeMember`
```
{ name: String (required), role: String (required),   // "President", "Secretary", ...
  isExecutive: Boolean,                                // executive committee list
  order: Number, photo: String (URL), status: enum }
```
Seed roles: Chief Patron — Sona Haldar; President — Dilip Barman; Vice President — Dilip Ghosh; Secretary — Avijit Karmakar; Asst. Secretary — Sarojit Ghosh; Cashier — Aidu Barik; + 15 executive members (see `governing-body.md`).

### 5.3 `DurgaPuja` — one doc per year
```
{ year: Number (unique, required),
  theme: String,                        // e.g. "Chennakeshava Temple, Belur (2014)"
  description: String,                   // long text
  awards: [String],                      // list of awards that year
  coverImage: String (URL),
  images: [String],                      // full-size URLs
  status: enum }
```
Seed years present in source: **2014, 2011, 2010, 2009, 2008, 2007** (descriptions/awards) plus gallery years **2016, 2015, 2013, 2010** (photos). Map photos to matching years; where only photos exist, create the year with `theme`/`description` empty (CMS fills later).

### 5.4 `GalleryAlbum`
```
{ slug: String (unique),
  title: String (required),             // "Durga Puja 2016", "Cricket", "Cultural", "Social", "Road Show", "Health"
  category: enum ["activities","durgapuja"] (required),
  year: Number,
  coverImage: String (URL),
  images: [{ full: String, thumb: String, caption: String }],
  order: Number, status: enum }
```
Build albums from `photogallery/`: pair `*b/*-big/*-b` (full) with `*s/*-small/*-s` (thumb). Suggested albums:
- **Activities:** Cricket (cricket1–4), Cultural (cultural1–4), Social (social1–4), Road Show (road-show1–4), Health (health1–2).
- **Durga Puja:** 2016 (2016-*), 2015 (2015-*), 2013 (2013-*), plus older sets (d101–d108, dp8-*, puja09*).

### 5.5 `Service`
```
{ name: String, description: String, teachers: [String],
  phones: [String], email: String, order: Number, status: enum }
```
Seed the 4 services from Section 2.3.

### 5.6 `PressItem` (empty now, model ready)
```
{ title, publication: String, date: Date, excerpt: String,
  link: String, image: String (URL), status: enum }
```

### 5.7 `SiteSetting` — singleton (`key: "global"`)
```
{ key: "global" (unique),
  clubName, tagline, foundedYear: 1983,
  address, email, website,
  socials: { facebook, instagram, youtube },
  hero: { slides: [{ image, headline, subtext, ctaLabel, ctaHref }] },
  stats: [{ label, value }]  // e.g. "8-9 lakh Puja visitors", "Since 1983"
}
```

### 5.8 `Enquiry` — contact submissions
```
{ type: enum ["general","membership","event"] (default "general"),
  name (required), email, phone, city, state, zip, country,
  subject, message (required),
  handled: Boolean (default false),     // for CMS triage
  meta: { ip: String, userAgent: String },
  createdAt }
```

### 5.9 `User` — **[CMS-later]** scaffold only
```
{ email (unique), passwordHash, name, role: enum ["admin","editor"], status: enum }
```
Create the model + `auth.routes.js` login stub now so the CMS phase only fills in logic.

---

## 6. Backend implementation (step by step)

### 6.1 Init
```
cd server
npm init -y
npm i express mongoose cors helmet morgan compression dotenv express-rate-limit zod
npm i -D nodemon
```
`package.json` scripts:
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seed.js"
  }
}
```

### 6.2 `src/config/db.js` — serverless-safe connection (CRITICAL)
```js
import mongoose from "mongoose";
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "jss",
      maxPoolSize: 5,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```
Call `await connectDB()` at the top of each request (middleware) so both local and serverless work.

### 6.3 `src/app.js` — build the app (no listen)
- Middlewares: `helmet()`, `compression()`, `cors({ origin: allowedOrigins })`, `express.json()`, `morgan("tiny")`, a `connectDB` middleware, `rateLimit` on `/api/enquiries`.
- Mount routes from `routes/index.js` under `/api`.
- `GET /api/health` → `{ ok: true }`.
- `notFound` + `errorHandler` last.
- `export default app;`

`allowedOrigins` from env `CLIENT_ORIGINS` (comma-separated) — include localhost + the deployed frontend domain.

### 6.4 `src/server.js` — local dev only
```js
import app from "./app.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API on :${PORT}`));
```

### 6.5 `api/index.js` + `vercel.json` — Vercel entry
```js
// server/api/index.js
import app from "../src/app.js";
export default app;   // Vercel Node runtime accepts an Express app as handler
```
```json
// server/vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }] }
```
> Deploy `server/` as its own Vercel project. Set env vars there (Section 9).

### 6.6 Routes & controllers

**Public (`public.routes.js`) — read-only + 2 form posts:**
```
GET  /api/health
GET  /api/settings                 -> SiteSetting singleton
GET  /api/pages/:slug              -> one published Page
GET  /api/committee                -> members sorted by order (patron/office first)
GET  /api/durga-puja               -> years desc (summary fields)
GET  /api/durga-puja/:year         -> one year full
GET  /api/gallery                  -> albums; ?category=activities|durgapuja
GET  /api/gallery/:slug            -> album with images
GET  /api/services                 -> services sorted
GET  /api/press                    -> press items desc by date
POST /api/enquiries                -> create Enquiry (contact form)
```
- Validate `POST /api/enquiries` with zod (name & message required; sanitize; strip HTML). Apply rate limit (e.g. 5/min/IP). Store `meta.ip`/`userAgent`. Never echo back stored PII beyond `{ ok: true }`.
- All list endpoints filter `status: "published"`.

**Admin (`admin.routes.js`) — [CMS-later], scaffold now, guarded:**
```
POST/PUT/DELETE  /api/admin/pages, /committee, /durga-puja, /gallery,
                 /services, /press, /settings, /enquiries (mark handled)
GET              /api/admin/enquiries (list all, incl. unpublished content)
```
Mount behind `authMiddleware`. In Phase 1 the middleware returns `501 Not Implemented` (or `401`) so the surface exists but is inert. **Do build the router file and wire it** — just leave handlers stubbed.

**Auth (`auth.routes.js`) — [CMS-later]:** `POST /api/auth/login` stub returning `501`.

Controllers use an `asyncHandler` wrapper + `ApiError` for consistent JSON errors: `{ error: { message, code } }`.

### 6.7 Seed script (`src/seed/seed.js`)
- Connects to DB, **wipes** content collections (guard with `--fresh` flag; refuse to run against a URI containing `prod` unless `--force`).
- Populates from hand-cleaned JSON in `src/seed/data/` (derive these JSON files from `scraped_site/content/*.md`, cleaning the scrape whitespace/table artifacts). Create: `pages.json`, `committee.json`, `durgaPuja.json`, `galleryAlbums.json`, `services.json`, `settings.json`.
- Converts markdown bodies → sanitized HTML (use `marked` + `sanitize-html`) for `Page.bodyHtml`.
- Image URLs in seed point to `/assets/...` and `/gallery/...` paths that exist in `client/public` after Section 7.7.
- Log a summary count per collection.

Run: `npm run seed -- --fresh`.

### 6.8 Backend security/quality checklist
- Helmet, CORS allow-list, body size limit (`express.json({ limit: "100kb" })`).
- Rate limit on write endpoints. Input validation on all writes.
- No secrets in code; all via env. `.env` in `.gitignore`.
- Consistent error shape; never leak stack traces in production (`NODE_ENV`).

---

## 7. Frontend implementation (step by step)

### 7.1 Init
```
npm create vite@latest client -- --template react
cd client
npm i react-router-dom react-helmet-async
npm i -D tailwindcss postcss autoprefixer @tailwindcss/typography @tailwindcss/forms
npx tailwindcss init -p
```
Add Tailwind config (Section 4.1). In `src/styles/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Import it in `main.jsx`. Wrap app in `<HelmetProvider>` and `<BrowserRouter>`.

### 7.2 API client (`src/lib/api.js`)
```js
const BASE = import.meta.env.VITE_API_BASE_URL;
export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" }, ...opts,
  });
  if (!res.ok) throw new Error((await res.json()).error?.message || res.statusText);
  return res.json();
}
```
`.env.example`: `VITE_API_BASE_URL=http://localhost:5000/api`

`src/hooks/useFetch.js`: small hook returning `{ data, loading, error }`; every page uses it. Provide skeleton loaders (`ui/Spinner`, `ui/EmptyState`).

### 7.3 Routing (`src/router.jsx`)
Define routes from Section 2.2, all wrapped in `<Layout>`. Add a `NotFound` 404 page. Use `useParams` for `/durga-puja/:year` (optional detail) and `/gallery/:slug`.

### 7.4 Layout components
- **Header/Nav:** sticky, shrinks on scroll; logo (wordmark "JSS" + full name), desktop horizontal nav with "Activities" dropdown. `aria-current` active state.
- **MobileDrawer:** hamburger → slide-in full-height drawer, large tap targets, focus trap, close on route change/esc.
- **Footer:** address, email, quick links, the 4 service phone numbers, socials (from settings), "© {year} Jatiya Shakti Sangha O Pathagar · Rebuilt 2026".
- **Layout:** `<Header/> <main>{children}</main> <Footer/>`, scroll-to-top on route change.

### 7.5 Pages (build each; all data via API)
- **Home (`/`):** `HeroSlider` (from `settings.hero.slides` — replaces old Flash), intro blurb, `HighlightCards` (Durga Puja, Sports, Social, Health, Library), `StatsStrip` (Since 1983, 8–9 lakh Puja visitors), Services teaser, `CtaBanner` (Become a member + Get in touch). All responsive, one column on mobile.
- **About (`/about`):** render `Page("about")` prose (history/preface) + `profile` note; timeline-style callout of founding story.
- **Committee (`/committee`):** office-bearers as prominent cards, executive members as a responsive grid/list.
- **Durga Puja (`/durga-puja`):** intro, then year sections (desc order) each with theme, description, awards (badges), and a photo strip linking to that year's gallery album. Optional `/durga-puja/:year` detail.
- **Sports / Social / Health / Library / Future-Plan / Members / Profile / Press:** render respective `Page` prose. `members` shows **Download Membership Form** button (`/membership-form.pdf`). Placeholder pages show a branded "Content being updated" state.
- **Gallery (`/gallery`):** tabs **Activities / Durga Puja** (from `?category`), album grid (`AlbumCard` with cover + count). `/gallery/:slug` → `ImageGrid` of thumbs opening a keyboard-accessible **React `Lightbox`** (replaces fancybox) showing full images with prev/next.
- **Contact (`/contact`):** club address/email + **EnquiryForm** (`type: "general"`, fields matching original: name, address, city, state, zip, country, phone, email, subject select [General/Membership/Event], message). On submit → `POST /api/enquiries` → success toast + reset. Client-side validation; disable button while submitting.

### 7.6 Shared UI
`Button`, `Container`, `Section`, `Card`, `Badge`, `Breadcrumb`, `Spinner`, `EmptyState`, `Toast`. Keep them small and composable. Use `prose prose-headings:font-display prose-a:text-maroon` for `Page.bodyHtml` (render via `dangerouslySetInnerHTML` — content is server-sanitized).

### 7.7 Asset migration & optimization
- Copy **only reusable** photos (Section 1) into `client/public/assets/` (content photos) and `client/public/gallery/` (gallery, keep thumb/full pairs). Copy `membership-form.pdf` to `client/public/`.
- Convert large JPEGs to reasonable sizes/WebP where easy (optional but recommended); keep filenames stable so seed URLs match. Provide a UPI QR placeholder image `client/public/assets/upi-qr.png` (**TODO: replace with real QR**).
- Create `favicon.ico`, `og-image.jpg` (use a strong Durga Puja photo), and add meta/OG tags via `<Seo>` per page.
- Do **not** copy any legacy GIF/SWF/slice chrome.

### 7.8 SEO & meta
- `react-helmet-async` `<Seo>` per page: title `"{Page} · Siliguri Jatiya Shakti Sangha"`, description, OG image, canonical.
- Add `public/robots.txt` + a generated `sitemap.xml` (static list of routes is fine for Phase 1).
- Semantic headings, descriptive alt text, JSON-LD `Organization` on Home (name, founding date, location, logo).

---

## 8. Local development workflow
1. **DB:** create a free **MongoDB Atlas** cluster (or local `mongod`). Get connection string.
2. **Server:** `server/.env` → `MONGODB_URI`, `MONGODB_DB=jss`, `PORT=5000`, `CLIENT_ORIGINS=http://localhost:5173`, `NODE_ENV=development`. Run `npm run seed -- --fresh` then `npm run dev`.
3. **Client:** `client/.env` → `VITE_API_BASE_URL=http://localhost:5000/api`. Run `npm run dev` (Vite on 5173).
4. Verify: home loads from API, gallery lightbox works, the contact form creates an `Enquiry` doc (check Atlas), mobile view at 360px is clean.

---

## 9. Deployment (Vercel + Atlas; Cloudflare Pages alt for FE)

### 9.1 Database
- MongoDB **Atlas** cluster. Network access: allow Vercel (0.0.0.0/0 acceptable for serverless, or Atlas + Vercel integration). Create DB user. Use the SRV URI.

### 9.2 Backend on Vercel (project: `jss-api`, root dir `server/`)
- `api/index.js` + `vercel.json` already route all traffic to the Express app.
- Env vars (Vercel dashboard → Settings → Environment Variables):
  - `MONGODB_URI`, `MONGODB_DB=jss`, `NODE_ENV=production`, `CLIENT_ORIGINS=https://<frontend-domain>`.
- Confirm Node version (set `"engines": { "node": ">=18" }` in `package.json`).
- After deploy, note the API URL, e.g. `https://jss-api.vercel.app`.
- **Seeding prod:** run the seed script locally pointed at the Atlas URI (one-time), or add a guarded admin action later. Do not expose seeding via HTTP.

### 9.3 Frontend
**Option A — Vercel (project `jss-web`, root `client/`):**
- Build: `npm run build`; Output: `dist`; Framework preset: Vite.
- Env: `VITE_API_BASE_URL=https://jss-api.vercel.app/api`.
- SPA rewrite `client/vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

**Option B — Cloudflare Pages (FE):**
- Build command `npm run build`, output dir `dist`, build var `VITE_API_BASE_URL=https://jss-api.vercel.app/api`.
- Add SPA fallback (Pages serves `index.html` for unknown routes by default with a `_redirects`: `/*  /index.html  200`).

### 9.4 Post-deploy
- Update backend `CLIENT_ORIGINS` to the real frontend domain(s) and redeploy → verify CORS.
- Smoke test on a real phone. Run Lighthouse mobile.
- Point the domain (siligurijss.org) when ready.

---

## 10. Environment variables reference
**server/.env**
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=jss
PORT=5000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:5173,https://jss-web.vercel.app
# [CMS-later] JWT_SECRET=...
```
**client/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 11. Build phases & checklist

**Phase 0 — Scaffolding**
- [ ] Create monorepo structure, `.gitignore`, root `README.md` (quickstart).
- [ ] Init `server` and `client` with deps above. Init git (repo currently not a git repo).

**Phase 1 — Backend**
- [ ] `db.js` (cached), `app.js`, `server.js`, `api/index.js`, `vercel.json`.
- [ ] All models (Section 5), incl. stubbed `User`.
- [ ] Public routes + controllers + validation + error handling.
- [ ] Admin/auth routers scaffolded (stubbed 501) behind `authMiddleware`.
- [ ] Seed data JSON derived & cleaned from `scraped_site/content`; `seed.js` works.

**Phase 2 — Frontend**
- [ ] Tailwind + design tokens + fonts; base layout (Header/Drawer/Footer).
- [ ] API client + `useFetch` + loading/empty/error states.
- [ ] All pages (Section 2.2) wired to API; forms post enquiries.
- [ ] Gallery with React lightbox; Home hero slider.
- [ ] Asset migration + SEO/meta + favicon/OG.

**Phase 3 — QA & deploy**
- [ ] Responsive pass at 360/390/768/1024/1280; real-phone check.
- [ ] Lighthouse mobile Perf ≥ 90, A11y ≥ 95.
- [ ] Deploy API (Vercel) + DB (Atlas) + FE (Vercel/Cloudflare); fix CORS; seed prod.

**Phase 4 — [CMS-later] (not now, but ready)**
- Implement `User` auth (JWT), fill admin CRUD handlers, build CMS UI (protected React area or separate app), add image uploads (Cloudinary/Vercel Blob). No public-frontend or schema changes required.

---

## 12. Acceptance criteria (Phase 1 "done")
1. Every route in 2.2 renders real content fetched from the API (seeded from scraped material).
2. Site is fully usable and looks polished on a 360px phone; nav drawer, gallery lightbox, and forms all work on touch.
3. The contact form persists `Enquiry` docs in MongoDB.
4. No Flash, no legacy GIF chrome, no dead links.
5. Backend runs as a Vercel serverless function with a cached Mongo connection; admin/auth routes exist but are inert (501/401).
6. Design uses the Warm Heritage tokens consistently; content is CMS-editable in shape (Pages + structured collections + settings singleton).
7. Placeholder sections (profile/members/press/library extras) show a branded "being updated" state, not errors.

---

## 13. Open TODOs to confirm with the club (non-blocking; use placeholders)
- Confirm **current committee** list (seed uses scraped names).
- Any **new photos / recent Durga Puja years** beyond 2016.
- Social media handles (Facebook/Instagram/YouTube) for footer.
- Final logo artwork (Phase 1 uses a typographic wordmark).
