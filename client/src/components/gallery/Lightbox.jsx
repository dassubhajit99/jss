import { useEffect, useCallback } from "react";

export function Lightbox({ images, index, onClose, onNav }) {
  const prev = useCallback(() => onNav((index - 1 + images.length) % images.length), [index, images.length, onNav]);
  const next = useCallback(() => onNav((index + 1) % images.length), [index, images.length, onNav]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  if (index == null) return null;
  const img = images[index];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4" role="dialog" aria-modal="true">
      <button className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20" aria-label="Close" onClick={onClose}>
        ✕
      </button>
      <button className="absolute left-2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 md:left-6" aria-label="Previous" onClick={prev}>
        ‹
      </button>
      <figure className="max-h-full max-w-4xl text-center">
        <img src={img.full} alt={img.caption || ""} className="mx-auto max-h-[80vh] w-auto rounded-xl object-contain" />
        <figcaption className="mt-3 text-sm text-cream/80">
          {img.caption} <span className="text-cream/50">· {index + 1} / {images.length}</span>
        </figcaption>
      </figure>
      <button className="absolute right-2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 md:right-6" aria-label="Next" onClick={next}>
        ›
      </button>
    </div>
  );
}
