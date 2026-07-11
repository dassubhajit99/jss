import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AdminLayout } from "./components/AdminLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PagesList from "./pages/PagesList.jsx";
import PageForm from "./pages/PageForm.jsx";
import CommitteeList from "./pages/CommitteeList.jsx";
import CommitteeForm from "./pages/CommitteeForm.jsx";
import DurgaPujaList from "./pages/DurgaPujaList.jsx";
import DurgaPujaForm from "./pages/DurgaPujaForm.jsx";
import AlbumsList from "./pages/AlbumsList.jsx";
import AlbumForm from "./pages/AlbumForm.jsx";
import ServicesList from "./pages/ServicesList.jsx";
import ServiceForm from "./pages/ServiceForm.jsx";
import PressList from "./pages/PressList.jsx";
import PressForm from "./pages/PressForm.jsx";
import SettingsForm from "./pages/SettingsForm.jsx";
import EnquiriesList from "./pages/EnquiriesList.jsx";

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="pages" element={<PagesList />} />
            <Route path="pages/new" element={<PageForm />} />
            <Route path="pages/:id" element={<PageForm />} />

            <Route path="committee" element={<CommitteeList />} />
            <Route path="committee/new" element={<CommitteeForm />} />
            <Route path="committee/:id" element={<CommitteeForm />} />

            <Route path="durga-puja" element={<DurgaPujaList />} />
            <Route path="durga-puja/new" element={<DurgaPujaForm />} />
            <Route path="durga-puja/:id" element={<DurgaPujaForm />} />

            <Route path="gallery" element={<AlbumsList />} />
            <Route path="gallery/new" element={<AlbumForm />} />
            <Route path="gallery/:id" element={<AlbumForm />} />

            <Route path="services" element={<ServicesList />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id" element={<ServiceForm />} />

            <Route path="press" element={<PressList />} />
            <Route path="press/new" element={<PressForm />} />
            <Route path="press/:id" element={<PressForm />} />

            <Route path="settings" element={<SettingsForm />} />
            <Route path="enquiries" element={<EnquiriesList />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
