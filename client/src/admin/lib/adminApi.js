import { api } from "../../lib/api.js";

// Module-level auth hooks, registered by AuthProvider on mount. This lets
// plain (non-hook) helpers like uploadImage() access the current token and
// trigger a forced logout without prop-drilling.
let getToken = () => "";
let onUnauthorized = () => {};

export function registerAuth({ getToken: gt, onUnauthorized: ou }) {
  getToken = gt;
  onUnauthorized = ou;
}

// Authed fetch wrapper: attaches Bearer token, forces logout on 401.
export async function adminApi(path, opts = {}) {
  const token = getToken();
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await api(path, { ...opts, headers });
  } catch (err) {
    if (err.status === 401) onUnauthorized();
    throw err;
  }
}

// Convenience GET that unwraps { data }.
export async function adminGet(path) {
  const body = await adminApi(path);
  return body?.data;
}

// JSON body helper for POST/PUT/PATCH/DELETE.
export async function adminSend(method, path, body) {
  const res = await adminApi(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res?.data;
}

// Uploads a File to Cloudinary via the signed direct-upload flow.
// Returns the Cloudinary secure_url string.
export async function uploadImage(file) {
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be smaller than 10 MB");
  }

  const sig = await adminGet("/admin/uploads/sign");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", sig.timestamp);
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || "Upload failed");
  }
  return json.secure_url;
}

// Injects a Cloudinary transformation for a smaller thumbnail. Returns the
// url unchanged if it doesn't look like a Cloudinary delivery URL.
export function thumbUrl(url, w = 480) {
  if (!url || typeof url !== "string" || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/c_fill,w_${w},h_${Math.round((w * 3) / 4)},q_auto,f_auto/`);
}
