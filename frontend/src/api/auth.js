import { api } from "./client";

export async function register(payload) {
  const res = await api.post("/register/", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/login/", payload);
  return res.data; // {access, refresh}
}

export async function me() {
  const res = await api.get("/me/");
  return res.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("me");
}