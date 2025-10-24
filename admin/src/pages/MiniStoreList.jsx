import { useEffect, useState } from "react";
import { api } from "../api";

export default function MiniStoreList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/api/ministores?all=1");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setMsg("❌ " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await api(`/api/ministores/${id}/toggle`, { method: "PATCH" }); load(); }
    catch (e) { setMsg("❌ " + e.message); }
  };

  const del = async (id) => {
    if (!confirm("Delete this mini store?")) return;
    try { await api(`/api/ministores/${id}`, { method: "DELETE" }); load(); }
    catch (e) { setMsg("❌ " + e.message); }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Mini Stores</h1>
      {msg && <div className="mb-3 text-sm">{msg}</div>}
      <div className="overflow-auto">
        <table className="min-w-[760px] w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">Slug</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="text-sm">
                <td className="p-2 border">{r.slug}</td>
                <td className="p-2 border">{r.displayName}</td>
                <td className="p-2 border">{r.isActive ? "Yes" : "No"}</td>
                <td className="p-2 border">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 border space-x-2">
                  <a className="underline" href={`/${r.slug}`} target="_blank" rel="noreferrer">View</a>
                  <button onClick={() => toggle(r._id)} className="px-2 py-1 border rounded">
                    {r.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => del(r._id)} className="px-2 py-1 border rounded text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-3 text-center" colSpan={5}>No stores yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
