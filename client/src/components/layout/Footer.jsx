import { Link } from "react-router-dom";
import { useSettings } from "../../lib/SettingsContext.jsx";

export function Footer() {
  const s = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-maroon-900 text-cream">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold text-gold-300">
            {s.clubName || "Jatiya Shakti Sangha O Pathagar"}
          </h3>
          <p className="mt-3 text-sm text-cream/80">{s.tagline}</p>
          {s.address && <p className="mt-3 text-sm text-cream/80">{s.address}</p>}
          {s.email && (
            <p className="mt-2 text-sm">
              <a href={`mailto:${s.email}`} className="text-gold-300 hover:underline">
                {s.email}
              </a>
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-300">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {[
              ["About", "/about"],
              ["Durga Puja", "/durga-puja"],
              ["Gallery", "/gallery"],
              ["Members", "/members"],
              ["Contact", "/contact"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="hover:text-gold-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-300">
            Programmes & Services
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li>Dance School · +91 9434496046</li>
            <li>Kaizen Karate-DO · +91 9832480087</li>
            <li>JSS Cricket Academy · +91 8101787288</li>
            <li>Ambulance (24×7, Siliguri) · +91 7797638863</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-maroon-700">
        <div className="container-page py-4 text-center text-xs text-cream/70">
          © {year} {s.clubName || "Jatiya Shakti Sangha O Pathagar"} · Rebuilt {year}
        </div>
      </div>
    </footer>
  );
}
