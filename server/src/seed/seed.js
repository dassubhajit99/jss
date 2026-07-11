import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { sanitizeBodyHtml } from "../utils/sanitize.js";
import mongoose from "mongoose";
import {
  Page,
  CommitteeMember,
  DurgaPuja,
  GalleryAlbum,
  Service,
  PressItem,
  SiteSetting,
} from "../models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf-8"));

const argv = process.argv.slice(2);
const FRESH = argv.includes("--fresh");
const FORCE = argv.includes("--force");

function mdToHtml(md = "") {
  return sanitizeBodyHtml(marked.parse(md, { async: false }));
}

async function run() {
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  if (/prod/i.test(env.MONGODB_URI) && !FORCE) {
    throw new Error("URI looks like production. Re-run with --force to proceed.");
  }

  await connectDB();
  console.log(`Connected to ${env.MONGODB_DB}`);

  if (FRESH) {
    await Promise.all([
      Page.deleteMany({}),
      CommitteeMember.deleteMany({}),
      DurgaPuja.deleteMany({}),
      GalleryAlbum.deleteMany({}),
      Service.deleteMany({}),
      PressItem.deleteMany({}),
      SiteSetting.deleteMany({}),
    ]);
    console.log("Cleared content collections (--fresh).");
  }

  // Pages: markdown -> sanitized HTML
  const pages = readJson("pages.json").map(({ body, ...rest }) => ({
    ...rest,
    bodyHtml: mdToHtml(body),
  }));
  await Page.insertMany(pages, { ordered: false });

  await CommitteeMember.insertMany(readJson("committee.json"), { ordered: false });
  await DurgaPuja.insertMany(readJson("durgaPuja.json"), { ordered: false });
  await GalleryAlbum.insertMany(readJson("galleryAlbums.json"), { ordered: false });
  await Service.insertMany(readJson("services.json"), { ordered: false });

  const settings = readJson("settings.json");
  await SiteSetting.updateOne({ key: "global" }, settings, { upsert: true });

  const counts = {
    pages: await Page.countDocuments(),
    committee: await CommitteeMember.countDocuments(),
    durgaPuja: await DurgaPuja.countDocuments(),
    galleryAlbums: await GalleryAlbum.countDocuments(),
    services: await Service.countDocuments(),
    press: await PressItem.countDocuments(),
    settings: await SiteSetting.countDocuments(),
  };
  console.log("Seed complete:", counts);

  await mongoose.connection.close();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
