import mongoose from "mongoose";

const committeeMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true }, // "President", "Secretary", "Executive Member"...
    isExecutive: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    photo: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export const CommitteeMember =
  mongoose.models.CommitteeMember ||
  mongoose.model("CommitteeMember", committeeMemberSchema);
