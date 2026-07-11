import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SettingsProvider } from "./lib/SettingsContext.jsx";
import { Layout } from "./components/layout/Layout.jsx";

import Home from "./pages/Home.jsx";
import {
  AboutPage,
  ProfilePage,
  SportsPage,
  SocialPage,
  HealthPage,
  LibraryPage,
  FuturePlanPage,
  PressPage,
} from "./pages/SimplePages.jsx";
import CommitteePage from "./pages/CommitteePage.jsx";
import DurgaPujaPage from "./pages/DurgaPujaPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import AlbumPage from "./pages/AlbumPage.jsx";
import MembersPage from "./pages/MembersPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFound from "./pages/NotFound.jsx";

const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

function PublicShell() {
  return (
    <SettingsProvider>
      <Layout>
        <Outlet />
      </Layout>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/committee" element={<CommitteePage />} />
        <Route path="/durga-puja" element={<DurgaPujaPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/future-plan" element={<FuturePlanPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:slug" element={<AlbumPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
