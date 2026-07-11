import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";

export function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
