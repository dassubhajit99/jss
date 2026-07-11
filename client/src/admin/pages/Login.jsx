import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { Field, Input } from "../components/FormField.jsx";

export default function Login() {
  const { login, token, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (ready && token) {
    return <Navigate to={location.state?.from?.pathname || "/admin"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream-200 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-semibold text-maroon">Jatiya Shakti Sangha</p>
          <p className="mt-1 text-sm text-ink-700">Admin console</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm font-medium text-maroon">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-700 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
