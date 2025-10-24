export const BACKEND = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

export async function api(path, options = {}) {
  const url = path.startsWith("/api") ? `${BACKEND}${path}` : `${BACKEND}/api${path}`;
  const headers = { ...(options.headers || {}) };

  // Only JSON gets Content-Type; FormData should not
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP_${res.status}`);
  return data;
}
