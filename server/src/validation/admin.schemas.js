import { z } from "zod";

// Shared pieces
const status = z.enum(["draft", "published"]).default("published");
const url = z.string().trim().max(1000).default(""); // image URLs (Cloudinary secure_url or /assets/…)
export const oid = z.string().regex(/^[0-9a-f]{24}$/, "Invalid id");

export const reorderSchema = z.object({
  ids: z.array(oid).min(1),
});

// ---- Pages ----------------------------------------------------------------
const slug = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only");

export const pageCreate = z.object({
  slug,
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).default(""),
  bodyHtml: z.string().max(200_000).default(""),
  heroImage: url,
  seo: z
    .object({
      title: z.string().trim().max(200).default(""),
      description: z.string().trim().max(400).default(""),
      ogImage: url,
    })
    .default({}),
  order: z.number().int().default(0),
  status,
});
export const pageUpdate = pageCreate.partial();

// ---- Committee --------------------------------------------------------------
export const committeeCreate = z.object({
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(120),
  isExecutive: z.boolean().default(false),
  order: z.number().int().default(0),
  photo: url,
  status,
});
export const committeeUpdate = committeeCreate.partial();

// ---- Durga Puja -------------------------------------------------------------
export const durgaPujaCreate = z.object({
  year: z.number().int().min(1983).max(2100),
  theme: z.string().trim().max(300).default(""),
  description: z.string().max(20_000).default(""),
  awards: z.array(z.string().trim().min(1).max(300)).default([]),
  coverImage: url,
  images: z.array(z.string().trim().min(1).max(1000)).default([]),
  status,
});
export const durgaPujaUpdate = durgaPujaCreate.partial();

// ---- Gallery ------------------------------------------------------------------
export const galleryCreate = z.object({
  slug,
  title: z.string().trim().min(1).max(200),
  category: z.enum(["activities", "durgapuja"]),
  year: z.number().int().optional().nullable(),
  coverImage: url,
  images: z
    .array(
      z.object({
        full: z.string().trim().min(1),
        thumb: z.string().trim().default(""),
        caption: z.string().trim().max(300).default(""),
      })
    )
    .default([]),
  order: z.number().int().default(0),
  status,
});
export const galleryUpdate = galleryCreate.partial();

// ---- Services -----------------------------------------------------------------
export const serviceCreate = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  teachers: z.array(z.string().trim().min(1).max(200)).default([]),
  phones: z.array(z.string().trim().min(1).max(40)).default([]),
  email: z.string().trim().email().max(200).or(z.literal("")).default(""),
  order: z.number().int().default(0),
  status,
});
export const serviceUpdate = serviceCreate.partial();

// ---- Press -----------------------------------------------------------------
export const pressCreate = z.object({
  title: z.string().trim().min(1).max(300),
  publication: z.string().trim().max(200).default(""),
  date: z.coerce.date().optional().nullable(),
  excerpt: z.string().trim().max(1000).default(""),
  link: url,
  image: url,
  status,
});
export const pressUpdate = pressCreate.partial();

// ---- Settings (singleton) -----------------------------------------------------
export const settingsUpdate = z.object({
  clubName: z.string().trim().max(300).optional(),
  tagline: z.string().trim().max(300).optional(),
  foundedYear: z.number().int().optional(),
  address: z.string().trim().max(1000).optional(),
  email: z.string().trim().email().max(200).or(z.literal("")).optional(),
  website: z.string().trim().max(300).optional(),
  socials: z
    .object({
      facebook: z.string().trim().max(500).default(""),
      instagram: z.string().trim().max(500).default(""),
      youtube: z.string().trim().max(500).default(""),
    })
    .default({}),
  hero: z
    .object({
      slides: z
        .array(
          z.object({
            image: url,
            headline: z.string().trim().max(300).default(""),
            subtext: z.string().trim().max(500).default(""),
            ctaLabel: z.string().trim().max(100).default(""),
            ctaHref: z.string().trim().max(500).default(""),
          })
        )
        .default([]),
    })
    .default({ slides: [] }),
  stats: z
    .array(
      z.object({
        label: z.string().trim().max(200),
        value: z.string().trim().max(200),
      })
    )
    .default([]),
});
// key is intentionally not part of the schema; controller strips it too.

// ---- Enquiries ------------------------------------------------------------
export const enquiryPatch = z.object({
  handled: z.boolean(),
});
