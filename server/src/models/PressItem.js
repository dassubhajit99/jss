import mongoose from "mongoose";

const pressItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    publication: { type: String, default: "" },
    date: { type: Date },
    excerpt: { type: String, default: "" },
    link: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const PressItem =
  mongoose.models.PressItem || mongoose.model("PressItem", pressItemSchema);
