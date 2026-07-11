import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks } from "./navConfig.js";
import { Button } from "../ui/index.jsx";
import { MobileDrawer } from "./MobileDrawer.jsx";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Home">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-maroon font-display text-lg font-bold text-gold-300">
        JSS
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-display text-base font-bold text-maroon">
          Jatiya Shakti Sangha
        </span>
        <span className="block text-xs text-ink-700">Champasari, Siliguri · Est. 1983</span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
      {navLinks.map((link) =>
        link.children ? (
          <div key={link.label} className="group relative">
            <button className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:text-maroon">
              {link.label} <span aria-hidden>▾</span>
            </button>
            <div className="invisible absolute left-0 top-full z-20 min-w-48 rounded-xl border border-cream-200 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
              {link.children.map((c) => (
                <NavLink
                  key={c.to}
                  to={c.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm ${
                      isActive ? "bg-cream-200 text-maroon" : "text-ink-700 hover:bg-cream-200"
                    }`
                  }
                >
                  {c.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "text-maroon" : "text-ink-700 hover:text-maroon"
              }`
            }
          >
            {link.label}
          </NavLink>
        )
      )}
    </nav>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-cream-200 bg-cream/95 backdrop-blur transition ${
        scrolled ? "shadow-soft" : ""
      }`}
    >
      <div className="container-page flex items-center justify-between py-3">
        <Brand />
        <div className="flex items-center gap-3">
          <DesktopNav />
          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-cream-200 text-maroon lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
