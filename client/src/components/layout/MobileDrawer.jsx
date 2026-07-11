import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { navLinks } from "./navConfig.js";

// Flattens nav (groups become a labelled section) for the mobile list.
export function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-cream shadow-soft transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <span className="font-display text-lg font-bold text-maroon">Menu</span>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-cream-200 text-maroon"
            aria-label="Close menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="mb-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {link.label}
                </p>
                {link.children.map((c) => (
                  <DrawerLink key={c.to} to={c.to} label={c.label} nested />
                ))}
              </div>
            ) : (
              <DrawerLink key={link.to} to={link.to} label={link.label} end={link.to === "/"} />
            )
          )}
        </nav>
      </div>
    </div>
  );
}

function DrawerLink({ to, label, end, nested }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-3 text-base ${nested ? "pl-6" : "font-medium"} ${
          isActive ? "bg-cream-200 text-maroon" : "text-ink hover:bg-cream-200"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
