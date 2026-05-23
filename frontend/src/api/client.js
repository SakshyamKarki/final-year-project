import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original.__isRetry) {
      original.__isRetry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return Promise.reject(error);

      try {
        const r = await axios.post(`${API_BASE_URL}/refresh/`, { refresh });
        const access = r.data?.access;
        if (access) {
          localStorage.setItem("access_token", access);
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("me");
      }
    }

    return Promise.reject(error);
  }
);