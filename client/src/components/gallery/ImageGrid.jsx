import { useState } from "react";
import { Lightbox } from "./Lightbox.jsx";

export function ImageGrid({ images = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={i}
            className="group aspect-square overflow-hidden rounded-xl bg-cream-200"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open image ${i + 1}`}
          >
            <img
              src={img.thumb || img.full}
              alt={img.caption || ""}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      {openIndex != null && (
        <Lightbox images={images} index={openIndex} onClose={() => setOpenIndex(null)} onNav={setOpenIndex} />
      )}
    </>
  );
}
