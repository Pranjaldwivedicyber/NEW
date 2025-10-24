import axios from "axios";

export const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: false,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
