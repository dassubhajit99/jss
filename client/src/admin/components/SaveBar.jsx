export function SaveBar({ saving, error, onCancel, saveLabel = "Save" }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 border-t border-cream-200 bg-white/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-maroon">{error || ""}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
