import { useEffect, useRef, useState } from "react";
import { thumbUrl, uploadImage } from "../lib/adminApi.js";
import { useToast } from "./Toast.jsx";

// mode "strings": value is string[] of image URLs (e.g. DurgaPuja.images).
// mode "objects": value is {full, thumb, caption}[] (e.g. GalleryAlbum.images).
export function ImagesField({ value = [], onChange, mode = "strings", label }) {
  const inputRef = useRef(null);
  const [pending, setPending] = useState([]); // [{id, file, previewUrl}]
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // "i/n" while uploading
  const toast = useToast();

  // Keep a ref to the latest pending list so the unmount cleanup below
  // can revoke whatever is current, not just what existed at mount time.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  // Revoke all pending preview URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function thumbFor(item) {
    return mode === "objects" ? item.thumb || thumbUrl(item.full) : thumbUrl(item);
  }
  function fullFor(item) {
    return mode === "objects" ? item.full : item;
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const additions = [];
    files.forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name || "File"} is not an image`);
        return;
      }
      additions.push({
        id: crypto.randomUUID?.() ?? String(Date.now() + index),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });
    if (additions.length) setPending((prev) => [...prev, ...additions]);
  }

  function discardPending(id) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearPending() {
    pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setPending([]);
  }

  async function uploadAll() {
    setUploading(true);
    const added = [];
    const failed = [];
    const total = pending.length;
    for (let i = 0; i < total; i++) {
      const item = pending[i];
      setProgress(`${i + 1}/${total}`);
      try {
        const url = await uploadImage(item.file);
        added.push(mode === "objects" ? { full: url, thumb: thumbUrl(url), caption: "" } : url);
        URL.revokeObjectURL(item.previewUrl);
      } catch (err) {
        toast.error(err.message || "Upload failed");
        failed.push(item);
      }
    }
    setProgress(null);
    setUploading(false);
    setPending(failed);
    if (added.length) {
      onChange([...value, ...added]);
      toast.success(`Uploaded ${added.length} image${added.length === 1 ? "" : "s"}`);
    }
  }

  function remove(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function move(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = value.slice();
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function updateCaption(idx, caption) {
    const next = value.slice();
    next[idx] = { ...next[idx], caption };
    onChange(next);
  }

  return (
    <div>
      {label && <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>}
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-2"
          >
            <img
              src={thumbFor(item)}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            {mode === "objects" ? (
              <input
                type="text"
                value={item.caption || ""}
                onChange={(e) => updateCaption(idx, e.target.value)}
                placeholder="Caption"
                className="block flex-1 rounded-lg border-cream-200 text-sm text-ink"
              />
            ) : (
              <span className="flex-1 truncate text-xs text-ink-700">{fullFor(item)}</span>
            )}
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded-lg px-2 py-1 text-sm text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === value.length - 1}
                className="rounded-lg px-2 py-1 text-sm text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-lg px-2 py-1 text-sm text-maroon hover:bg-maroon/10"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-maroon/50 bg-maroon/5 p-2">
          <div className="mb-2 text-xs font-medium text-maroon">
            Selected — not uploaded yet ({pending.length})
          </div>
          <div className="space-y-2">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-2"
              >
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <span className="flex-1 truncate text-xs text-ink-700">{item.file.name}</span>
                <button
                  type="button"
                  onClick={() => discardPending(item.id)}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-sm text-maroon hover:bg-maroon/10 disabled:opacity-30"
                  aria-label="Discard"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={uploadAll}
              disabled={uploading}
              className="rounded-xl bg-maroon px-3 py-1.5 text-xs font-semibold text-white hover:bg-maroon/90 disabled:opacity-60"
            >
              {uploading ? `Uploading ${progress}…` : `Upload all (${pending.length})`}
            </button>
            <button
              type="button"
              onClick={clearPending}
              disabled={uploading}
              className="rounded-xl border border-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-200 disabled:opacity-30"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white"
        >
          Add images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>
    </div>
  );
}
