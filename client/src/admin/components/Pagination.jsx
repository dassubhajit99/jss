export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-cream-200 bg-white px-3 py-1.5 font-medium text-ink hover:bg-cream-200 disabled:opacity-40"
      >
        Prev
      </button>
      <span className="font-semibold text-maroon">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl border border-cream-200 bg-white px-3 py-1.5 font-medium text-ink hover:bg-cream-200 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
