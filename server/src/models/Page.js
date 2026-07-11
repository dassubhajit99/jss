import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      ogImage: { type: String, default: "" },
    },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);
