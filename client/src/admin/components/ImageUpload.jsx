import { useRef, useState } from "react";
import { uploadImage } from "../lib/adminApi.js";
import { useToast } from "./Toast.jsx";

export function ImageUpload({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>}
      <div className="flex items-start gap-4">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cream-200 bg-cream-200/40">
          {value ? (
            <img src={value} alt="" className="h-32 w-32 object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-ink-700/60">No image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white disabled:opacity-60"
            >
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-200"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <input
            type="text"
            readOnly
            value={value || ""}
            placeholder="No image uploaded"
            className="block w-full truncate rounded-lg border-cream-200 bg-cream-200/30 text-xs text-ink-700"
          />
        </div>
      </div>
    </div>
  );
}
