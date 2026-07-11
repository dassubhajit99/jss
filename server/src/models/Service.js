import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    teachers: { type: [String], default: [] },
    phones: { type: [String], default: [] },
    email: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
