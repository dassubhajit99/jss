import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { api } from "../lib/api.js";
import { registerAuth } from "./lib/adminApi.js";

const TOKEN_KEY = "jss_admin_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  const login = useCallback(async (email, password) => {
    const body = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const { token: newToken, user: newUser } = body.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // Register token getter + forced-logout hook for the non-hook adminApi module.
  useEffect(() => {
    registerAuth({
      getToken: () => tokenRef.current,
      onUnauthorized: () => clear(),
    });
  }, [clear]);

  // Restore session from a stored token on mount.
  useEffect(() => {
    let active = true;
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    api("/auth/me", { headers: { Authorization: `Bearer ${stored}` } })
      .then((body) => {
        if (!active) return;
        setUser(body.data.user);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        clear();
        setReady(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
