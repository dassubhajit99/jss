# Siliguri Jatiya Shakti Sangha (JSS) — Website

Rebuild of [siligurijss.org](http://siligurijss.org) — a community & cultural club
in Champasari, Siliguri, founded 1983. Modern, mobile-first, API-driven, CMS-ready.

See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for the full spec.

## Stack
- **client/** — Vite + React (JS) + Tailwind CSS (public site)
- **server/** — Express + Node.js, serverless-safe (Vercel), MongoDB + Mongoose
- **DB** — MongoDB (Atlas in production)

## Quickstart

### 1. Backend
```bash
cd server
cp .env.example .env          # fill MONGODB_URI
npm install
npm run seed -- --fresh       # load scraped content into DB
npm run dev                   # http://localhost:5000
```

### 2. Frontend
```bash
cd client
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

## Layout
```
client/         React app (public site)
server/         Express API + Mongoose models + seed
scraped_site/   Original scraped content (source of truth for seed)
```

## Deploy
Frontend + backend on Vercel; MongoDB on Atlas. See plan §9.
