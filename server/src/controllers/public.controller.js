import { z } from "zod";
import {
  Page,
  CommitteeMember,
  DurgaPuja,
  GalleryAlbum,
  Service,
  PressItem,
  SiteSetting,
  Enquiry,
} from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const PUBLISHED = { status: "published" };

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOne({ key: "global" }).lean();
  res.json({ data: settings || {} });
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, ...PUBLISHED }).lean();
  if (!page) throw ApiError.notFound("Page not found");
  res.json({ data: page });
});

export const getCommittee = asyncHandler(async (req, res) => {
  const members = await CommitteeMember.find(PUBLISHED)
    .sort({ isExecutive: 1, order: 1 })
    .lean();
  res.json({ data: members });
});

export const listDurgaPuja = asyncHandler(async (req, res) => {
  const years = await DurgaPuja.find(PUBLISHED)
    .sort({ year: -1 })
    .select("year theme description awards coverImage images")
    .lean();
  res.json({ data: years });
});

export const getDurgaPujaYear = asyncHandler(async (req, res) => {
  const doc = await DurgaPuja.findOne({
    year: Number(req.params.year),
    ...PUBLISHED,
  }).lean();
  if (!doc) throw ApiError.notFound("Durga Puja year not found");
  res.json({ data: doc });
});

export const listGallery = asyncHandler(async (req, res) => {
  const filter = { ...PUBLISHED };
  if (req.query.category) filter.category = req.query.category;
  const albums = await GalleryAlbum.find(filter)
    .sort({ order: 1, year: -1 })
    .select("slug title category year coverImage images")
    .lean();
  // Return counts, not full image arrays, on the list view.
  const data = albums.map(({ images, ...rest }) => ({
    ...rest,
    imageCount: images?.length || 0,
  }));
  res.json({ data });
});

export const getAlbum = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findOne({
    slug: req.params.slug,
    ...PUBLISHED,
  }).lean();
  if (!album) throw ApiError.notFound("Album not found");
  res.json({ data: album });
});

export const listServices = asyncHandler(async (req, res) => {
  const services = await Service.find(PUBLISHED).sort({ order: 1 }).lean();
  res.json({ data: services });
});

export const listPress = asyncHandler(async (req, res) => {
  const items = await PressItem.find(PUBLISHED).sort({ date: -1 }).lean();
  res.json({ data: items });
});

const enquirySchema = z.object({
  type: z.enum(["general", "membership", "event"]).default("general"),
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const data = req.body;
  await Enquiry.create({
    ...data,
    meta: {
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    },
  });
  // Never echo stored PII back.
  res.status(201).json({ ok: true });
});

export { enquirySchema };
