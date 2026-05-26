import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(() => {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  });

  // Track auth state reactively — avoids stale closures from reading
  // localStorage directly in derived values.
  const [isAuthed, setIsAuthed] = useState(
    () => !!localStorage.getItem("access_token")
  );

  const refreshMe = useCallback(async () => {
    const data = await authApi.me();
    localStorage.setItem("me", JSON.stringify(data));
    setMe(data);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      me,
      isAuthed,

      async login({ username, password }) {
        const tokens = await authApi.login({ username, password });
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        setIsAuthed(true);
        await refreshMe();
      },

      async register(payload) {
        return authApi.register(payload);
      },

      async logout() {
        await authApi.logout(); // blacklists refresh token server-side
        setMe(null);
        setIsAuthed(false);
      },

      refreshMe,
    }),
    [me, isAuthed, refreshMe]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function isAdmin(me) {
  return !!(me?.is_staff || me?.is_superuser);
}
