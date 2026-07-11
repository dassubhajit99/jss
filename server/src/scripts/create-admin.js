import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/index.js";

const USAGE = `Usage:
  npm run create-admin -- --email admin@example.com --password 'S3cret!' [--name "Admin"] [--role admin]

Falls back to ADMIN_EMAIL / ADMIN_PASSWORD env vars when flags are absent.`;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      out[key] = value;
      i++;
    }
  }
  return out;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  const email = (args.email || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = args.password || process.env.ADMIN_PASSWORD || "";
  const name = args.name || "Admin";
  const role = args.role || "admin";

  if (!email || !password) {
    console.error(USAGE);
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email address.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  if (!["admin", "editor"].includes(role)) {
    console.error('Role must be "admin" or "editor".');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash, name, role, status: "active" },
    { upsert: true, new: true }
  );

  console.log(`Created/updated admin ${user.email} (${user.role})`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("create-admin failed:", err);
  process.exit(1);
});
