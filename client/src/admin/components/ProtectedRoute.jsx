import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { token, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-gold" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
