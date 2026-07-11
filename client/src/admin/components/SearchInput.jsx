export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full min-w-0 rounded-xl border-cream-200 bg-white py-2 pl-3 pr-8 text-sm text-ink shadow-sm focus:border-maroon focus:ring-maroon"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-700/60 hover:text-maroon"
        >
          ✕
        </button>
      )}
    </div>
  );
}
