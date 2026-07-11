import { NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useAdminFetch } from "../hooks/useAdminFetch.js";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/committee", label: "Committee" },
  { to: "/admin/durga-puja", label: "Durga Puja" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/press", label: "Press" },
  { to: "/admin/settings", label: "Site Settings" },
  { to: "/admin/enquiries", label: "Enquiries", badgeKey: "unhandledEnquiries" },
];

export function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { data } = useAdminFetch("/admin/dashboard");

  return (
    <nav className="flex h-full flex-col bg-ink text-cream">
      <div className="px-5 py-6">
        <p className="font-display text-lg font-semibold text-cream">JSS Admin</p>
        <p className="text-xs text-cream/60">Content console</p>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-maroon text-white"
                    : "text-cream/80 hover:bg-white/10 hover:text-cream"
                }`
              }
            >
              <span>{item.label}</span>
              {item.badgeKey && data?.[item.badgeKey] > 0 && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-ink">
                  {data[item.badgeKey]}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-cream/70">
        <p className="truncate">{user?.email}</p>
        <div className="mt-3 flex items-center justify-between">
          <a href="/" target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">
            View site
          </a>
          <button
            type="button"
            onClick={logout}
            className="font-semibold text-cream/80 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
