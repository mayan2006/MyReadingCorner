import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/apiBase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/user/me");
    setCurrentUser(data.user || null);
    return data.user || null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/user/me");
        if (!cancelled) setCurrentUser(data.user || null);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((user) => {
    setCurrentUser(user || null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/user/logout");
    } catch {
      /* cookies are cleared on the server even if this fails */
    }
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      authReady,
      login,
      logout,
      setCurrentUser,
      refreshUser
    }),
    [currentUser, authReady, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
