const HONORIFICS = /^(sri|smt|dr|late|shri)\.?\s+/i;

function getInitials(name = "") {
  const cleaned = name.trim().replace(HONORIFICS, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Accepts a Tailwind size class (e.g. "w-16 h-16") or a number of px.
function sizeClasses(size) {
  if (typeof size === "number") return "";
  return size || "w-24 h-24";
}

function sizeStyle(size) {
  if (typeof size === "number") return { width: size, height: size };
  return undefined;
}

export function Avatar({ name, photo, size }) {
  const cls = sizeClasses(size);
  const style = sizeStyle(size);

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        className={`${cls} shrink-0 rounded-full object-cover shadow-soft`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-maroon text-gold-300 shadow-soft`}
      style={style}
      aria-hidden="true"
    >
      <span className="font-display text-xl font-semibold">{getInitials(name)}</span>
    </div>
  );
}
