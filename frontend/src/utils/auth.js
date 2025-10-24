export function getToken() {
  try { return localStorage.getItem("token") || ""; } catch { return ""; }
}
export function setToken(t) {
  try { localStorage.setItem("token", t || ""); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem("token"); } catch {}
}
export function isAuthed() {
  return !!getToken();
}
