import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const RESERVED = new Set([
  "", "home", "about", "contact", "collection", "collections", "cart", "checkout",
  "privacy-policy", "terms", "return-refund", "faqs", "login", "signup",
  "admin", "api", "sitemap.xml", "robots.txt", "search", "account", "orders", "product"
]);

export default function MiniStore() {
  const { api } = useContext(ShopContext);
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!slug || RESERVED.has(slug)) {
      setErr("reserved");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/api/ministores/${slug}`);
        setStore(data);
      } catch (error) {
        console.error(error);
        const code = error?.response?.status;
        setErr(code === 404 ? "notfound" : "network");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, api]);

  if (loading) return <div className="p-6">Loading store…</div>;
  if (err === "reserved") return <div className="p-6">Not a mini store.</div>;
  if (err === "notfound") return <div className="p-6">Store not found.</div>;
  if (err) return <div className="p-6">Something went wrong.</div>;

  return (
    <div className="min-h-screen">
      {store?.bannerUrl && (
        <div className="w-full h-40 md:h-56">
          <img src={store.bannerUrl} alt={store.displayName} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-6xl mx-auto p-4 md:p-6 flex items-center gap-4">
        {store?.avatarUrl && (
          <img className="w-16 h-16 rounded-full object-cover" src={store.avatarUrl} alt={store.displayName} />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{store.displayName}</h1>
          {store?.bio && <p className="text-sm text-gray-600">{store.bio}</p>}
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(store?.products ?? []).map((p) => (
          <a key={p._id} href={`/product/${p._id}`} className="block border rounded-lg p-2 hover:shadow">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <div className="mt-2">
              <div className="text-sm font-medium line-clamp-1">{p.name}</div>
              <div className="text-sm">₹{p.price}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
