import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["general", "membership", "event"],
      default: "general",
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    handled: { type: Boolean, default: false },
    meta: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Enquiry =
  mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
