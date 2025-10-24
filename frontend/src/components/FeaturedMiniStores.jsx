import React, { useEffect, useState, useContext } from "react";
import Title from "./Title";
import { ShopContext } from "../context/ShopContext";

export default function FeaturedMiniStores({ limit = 8 }) {
  const { backendUrl } = useContext(ShopContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/ministores?limit=${limit}`);
        const data = await res.json();
        setStores(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Mini stores load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, limit]);

  if (loading || !stores.length) return null;

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"CREATOR"} text2={"MINI STORES"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover the newest styles and trends curated by TinyMillion - where fashion meets individuality.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {stores.map((s) => (
          <a key={s.slug} href={`/${s.slug}`} className="group border rounded-xl overflow-hidden hover:shadow transition">
            <div className="w-full h-32 md:h-40 bg-gray-100">
              {s.bannerUrl && <img src={s.bannerUrl} alt={s.displayName} className="w-full h-full object-cover" />}
            </div>
            <div className="p-3 flex items-center gap-3">
              <img
                src={s.avatarUrl || "https://dummyimage.com/64x64/ddd/555&text=TM"}
                alt={s.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{s.displayName}</div>
                {s.bio && <div className="text-xs text-gray-500 line-clamp-1">{s.bio}</div>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
