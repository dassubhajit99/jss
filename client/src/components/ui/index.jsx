import { Link } from "react-router-dom";

export function Container({ className = "", children }) {
  return <div className={`container-page ${className}`}>{children}</div>;
}

export function Section({ className = "", children }) {
  return <section className={`py-12 md:py-20 ${className}`}>{children}</section>;
}

const btnBase =
  "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:ring-2";
const variants = {
  primary: "bg-maroon text-white hover:bg-maroon-700",
  cta: "bg-gold text-ink hover:bg-gold-600 hover:text-white",
  outline: "border border-maroon text-maroon hover:bg-maroon hover:text-white",
};

export function Button({ variant = "primary", as = "button", to, href, className = "", children, ...rest }) {
  const cls = `${btnBase} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  const Tag = as;
  return <Tag className={cls} {...rest}>{children}</Tag>;
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-cream-200 bg-white shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-block rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-maroon ${className}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, align = "left" }) {
  const alignCls = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold-600">{eyebrow}</p>}
      <h2 className="text-3xl font-bold text-ink md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-ink-700">{subtitle}</p>}
      <div className={`mt-4 h-0.5 w-16 bg-gold ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream-200 border-t-maroon" />
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "" }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {message && <p className="mt-2 text-ink-700">{message}</p>}
    </Card>
  );
}

export function ErrorState({ error }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-xl font-semibold text-maroon">Something went wrong</h3>
      <p className="mt-2 text-ink-700">{error?.message || "Please try again later."}</p>
    </Card>
  );
}
