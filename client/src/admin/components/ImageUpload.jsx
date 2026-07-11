import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../lib/adminApi.js";
import { useToast } from "./Toast.jsx";

export function ImageUpload({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const toast = useToast();

  // Revoke the local object URL whenever it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePick(e) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!picked.type || !picked.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setJustUploaded(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(picked);
    });
    setFile(picked);
  }

  function handleCancel() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setFile(null);
  }

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
      setJustUploaded(true);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setFile(null);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const hasPending = !!file;
  const displayImage = previewUrl || value;

  return (
    <div>
      {label && <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>}
      <div className="flex items-start gap-4">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cream-200 bg-cream-200/40">
          {displayImage ? (
            <img src={displayImage} alt="" className="h-32 w-32 object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-ink-700/60">No image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {hasPending ? (
            <>
              <p className="text-xs font-medium text-maroon">
                Selected — not uploaded yet. Click Upload.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={busy}
                  className="rounded-xl border border-maroon bg-maroon px-3 py-1.5 text-xs font-semibold text-white hover:bg-maroon/90 disabled:opacity-60"
                >
                  {busy ? "Uploading…" : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white disabled:opacity-60"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white"
              >
                {value ? "Change" : "Choose image"}
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
              {justUploaded && (
                <span className="text-xs font-medium text-green-700">Uploaded ✓</span>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePick}
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
