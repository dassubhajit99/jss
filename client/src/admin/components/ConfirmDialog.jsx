import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) ref.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h3>
        {message && <p className="mt-2 text-sm text-ink-700">{message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-200"
          >
            Cancel
          </button>
          <button
            ref={ref}
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
