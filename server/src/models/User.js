import mongoose from "mongoose";

// [CMS-later] Scaffold only. Auth logic is implemented in the CMS phase.
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
