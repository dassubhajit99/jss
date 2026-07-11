import { Link } from "react-router-dom";

export function AlbumCard({ album }) {
  return (
    <Link
      to={`/gallery/${album.slug}`}
      className="group block overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft"
    >
      <div className="aspect-[4/3] overflow-hidden bg-cream-200">
        {album.coverImage && (
          <img
            src={album.coverImage}
            alt={album.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-ink">{album.title}</h3>
        <p className="mt-1 text-sm text-ink-700">
          {album.imageCount ?? album.images?.length ?? 0} photos
        </p>
      </div>
    </Link>
  );
}
