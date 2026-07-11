import mongoose from "mongoose";

const durgaPujaSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true, index: true },
    theme: { type: String, default: "" },
    description: { type: String, default: "" },
    awards: { type: [String], default: [] },
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const DurgaPuja =
  mongoose.models.DurgaPuja || mongoose.model("DurgaPuja", durgaPujaSchema);
