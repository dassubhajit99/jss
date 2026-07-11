import { Link } from "react-router-dom";
import { useAdminFetch } from "../hooks/useAdminFetch.js";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const CARDS = [
  { key: "pages", label: "Pages", to: "/admin/pages" },
  { key: "committee", label: "Committee", to: "/admin/committee" },
  { key: "durgaPuja", label: "Durga Puja", to: "/admin/durga-puja" },
  { key: "gallery", label: "Gallery Albums", to: "/admin/gallery" },
  { key: "services", label: "Services", to: "/admin/services" },
  { key: "press", label: "Press", to: "/admin/press" },
  { key: "enquiries", label: "Enquiries", to: "/admin/enquiries" },
];

export default function Dashboard() {
  const { data, loading, error } = useAdminFetch("/admin/dashboard");

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-700">Overview of your site content.</p>

      {data?.unhandledEnquiries > 0 && (
        <Link
          to="/admin/enquiries"
          className="mt-6 block rounded-xl border border-gold bg-gold-300/30 px-4 py-3 text-sm font-semibold text-ink hover:bg-gold-300/50"
        >
          {data.unhandledEnquiries} unhandled {data.unhandledEnquiries === 1 ? "enquiry" : "enquiries"} — review now
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft transition hover:border-maroon"
          >
            <p className="text-3xl font-semibold text-maroon">{data?.[card.key] ?? 0}</p>
            <p className="mt-1 text-sm font-medium text-ink-700">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
