export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-700/70">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-maroon">{error}</span>}
    </label>
  );
}

const inputCls =
  "block w-full rounded-xl border-cream-200 bg-white text-sm text-ink shadow-sm focus:border-maroon focus:ring-maroon";

export function Input({ className = "", ...rest }) {
  return <input className={`${inputCls} ${className}`} {...rest} />;
}

export function NumberInput({ className = "", ...rest }) {
  return <input type="number" className={`${inputCls} ${className}`} {...rest} />;
}

export function Textarea({ className = "", rows = 4, ...rest }) {
  return <textarea rows={rows} className={`${inputCls} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={`${inputCls} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className = "", ...rest }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-700">
      <input
        type="checkbox"
        className={`rounded border-cream-200 text-maroon focus:ring-maroon ${className}`}
        {...rest}
      />
      {label}
    </label>
  );
}
