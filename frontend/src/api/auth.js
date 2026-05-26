import { api } from "./client";

export async function register(payload) {
  const res = await api.post("/register/", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/login/", payload);
  return res.data; // { access, refresh }
}

export async function me() {
  const res = await api.get("/me/");
  return res.data;
}

/**
 * Blacklists the stored refresh token server-side, then wipes local storage.
 * Errors are swallowed — the client-side logout should always succeed even
 * if the network call fails (e.g. token already expired).
 */
export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  if (refresh) {
    try {
      await api.post("/logout/", { refresh });
    } catch {
      // Ignore — proceed with client-side cleanup regardless
    }
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("me");
}
