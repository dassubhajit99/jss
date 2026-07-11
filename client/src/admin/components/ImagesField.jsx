import { useRef, useState } from "react";
import { thumbUrl, uploadImage } from "../lib/adminApi.js";
import { useToast } from "./Toast.jsx";

// mode "strings": value is string[] of image URLs (e.g. DurgaPuja.images).
// mode "objects": value is {full, thumb, caption}[] (e.g. GalleryAlbum.images).
export function ImagesField({ value = [], onChange, mode = "strings", label }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null); // "i/n" while uploading
  const toast = useToast();

  function thumbFor(item) {
    return mode === "objects" ? item.thumb || thumbUrl(item.full) : thumbUrl(item);
  }
  function fullFor(item) {
    return mode === "objects" ? item.full : item;
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const added = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`${i + 1}/${files.length}`);
      try {
        const url = await uploadImage(files[i]);
        added.push(mode === "objects" ? { full: url, thumb: thumbUrl(url), caption: "" } : url);
      } catch (err) {
        toast.error(err.message || "Upload failed");
      }
    }
    setProgress(null);
    if (added.length) onChange([...value, ...added]);
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

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!!progress}
          className="rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white disabled:opacity-60"
        >
          {progress ? `Uploading ${progress}…` : "Add images"}
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
