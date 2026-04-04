"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, ExternalLink } from "lucide-react";

type Place = {
  placeId: string;
  name: string;
  rating: number | null;
  reviewCount: number;
  vicinity: string;
  distanceKm: number;
};

type Category = {
  key: string;
  label: string;
  places: Place[];
};

const CATEGORY_EMOJI: Record<string, string> = {
  chinese_restaurant: "🍜",
  chinese_supermarket: "🏪",
  supermarket: "🛒",
  fine_dining: "🍽",
};

export function NearbyPlaces({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  function load() {
    if (data.length > 0) {
      setExpanded(true);
      return;
    }
    setExpanded(true);
    setLoading(true);
    fetch(`/api/places?propertyId=${propertyId}`)
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setData(cats);
        if (cats.length > 0) setActiveKey(cats[0].key);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (data.length > 0 && !activeKey) setActiveKey(data[0].key);
  }, [data, activeKey]);

  const activeCategory = data.find((c) => c.key === activeKey);

  function googleMapsUrl(place: Place) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.placeId}`;
  }

  return (
    <section className="content-wrap pt-10">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">周边设施</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">探索附近生活圈</h2>
          </div>
          {!expanded && (
            <button
              onClick={load}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              查看周边
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-6">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                正在加载周边信息...
              </div>
            )}

            {!loading && data.length > 0 && (
              <>
                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  {data.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveKey(cat.key)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeKey === cat.key
                          ? "bg-slate-950 text-white"
                          : "bg-white/70 text-slate-700 hover:bg-white"
                      }`}
                    >
                      {CATEGORY_EMOJI[cat.key]} {cat.label}
                    </button>
                  ))}
                </div>

                {/* Places list */}
                {activeCategory && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {activeCategory.places.length === 0 && (
                      <p className="text-sm text-slate-400">附近暂无相关地点</p>
                    )}
                    {activeCategory.places.map((place) => (
                      <a
                        key={place.placeId}
                        href={googleMapsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between gap-3 rounded-2xl bg-white/60 p-4 transition hover:bg-white"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-950">{place.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{place.distanceKm} km</span>
                            {place.rating && (
                              <>
                                <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                                <span>{place.rating} ({place.reviewCount})</span>
                              </>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-400">{place.vicinity}</p>
                        </div>
                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
