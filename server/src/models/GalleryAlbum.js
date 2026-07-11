import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    full: { type: String, required: true },
    thumb: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { _id: false }
);

const galleryAlbumSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["activities", "durgapuja"],
      required: true,
      index: true,
    },
    year: { type: Number },
    coverImage: { type: String, default: "" },
    images: { type: [galleryImageSchema], default: [] },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const GalleryAlbum =
  mongoose.models.GalleryAlbum ||
  mongoose.model("GalleryAlbum", galleryAlbumSchema);
