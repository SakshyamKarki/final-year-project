import React, { createContext, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(() => {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthed = !!localStorage.getItem("access_token");

  const value = useMemo(() => ({
    me,
    isAuthed,
    async refreshMe() {
      const data = await authApi.me();
      localStorage.setItem("me", JSON.stringify(data));
      setMe(data);
      return data;
    },
    async login({ username, password }) {
      const tokens = await authApi.login({ username, password });
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      await this.refreshMe();
    },
    async register(payload) {
      return authApi.register(payload);
    },
    logout() {
      authApi.logout();
      setMe(null);
    },
  }), [me, isAuthed]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function isAdmin(me) {
  return !!(me?.is_staff || me?.is_superuser);
}