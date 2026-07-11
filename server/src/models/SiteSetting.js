import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    image: String,
    headline: String,
    subtext: String,
    ctaLabel: String,
    ctaHref: String,
  },
  { _id: false }
);

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, index: true },
    clubName: { type: String, default: "Jatiya Shakti Sangha O Pathagar" },
    tagline: { type: String, default: "" },
    foundedYear: { type: Number, default: 1983 },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    hero: {
      slides: { type: [slideSchema], default: [] },
    },
    stats: {
      type: [{ label: String, value: String }],
      default: [],
    },
  },
  { timestamps: true }
);

export const SiteSetting =
  mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", siteSettingSchema);
