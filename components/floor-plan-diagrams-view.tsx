"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ZoomIn, Wallet } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-optimization";
import type { FloorPlanViewModel } from "@/lib/listing-view-model";

type FloorPlanDiagramsViewProps = {
  diagrams: Record<string, string[]>;
  floorPlans?: FloorPlanViewModel[];
  showRentCard?: boolean;
};

type FloorPlanImageCard = {
  url: string;
  name: string | null;
  monthlyRent: number | null;
  roomSizeSqFt: number | null;
};

type PriceSummary = {
  min: number;
  max: number;
  count: number;
};

const diagramCategories = [
  { value: "STUDIO", label: "Studio" },
  { value: "ONE_BED_ONE_BATH", label: "1B" },
  { value: "ONE_BED_DEN", label: "1B+Den" },
  { value: "TWO_BED_TWO_BATH", label: "2B" },
  { value: "THREE_BED_TWO_BATH", label: "3B" }
] as const;

function getPriceSummary(floorPlans: FloorPlanViewModel[], layoutKey: string): PriceSummary | null {
  const matching = floorPlans.filter((fp) => fp.layout === layoutKey);
  if (matching.length === 0) return null;
  const rents = matching.map((fp) => fp.monthlyRent);
  return {
    min: Math.min(...rents),
    max: Math.max(...rents),
    count: matching.length,
  };
}

function formatPriceRange(summary: PriceSummary | null): string | null {
  if (!summary) {
    return null;
  }

  return summary.min === summary.max
    ? `$${summary.min.toLocaleString()}`
    : `$${summary.min.toLocaleString()} – $${summary.max.toLocaleString()}`;
}

function getSqftRange(floorPlans: FloorPlanViewModel[], layoutKey: string): string | null {
  const sqfts = floorPlans
    .filter((fp) => fp.layout === layoutKey && fp.roomSizeSqFt)
    .map((fp) => fp.roomSizeSqFt!);
  if (sqfts.length === 0) return null;
  const min = Math.min(...sqfts);
  const max = Math.max(...sqfts);
  return min === max ? `${min} sq.ft` : `${min}–${max} sq.ft`;
}

function getImageCards(
  floorPlans: FloorPlanViewModel[],
  diagrams: Record<string, string[]>,
  layoutKey: string
): FloorPlanImageCard[] {
  const metadataByUrl = new Map<string, FloorPlanImageCard>();

  for (const floorPlan of floorPlans.filter((fp) => fp.layout === layoutKey)) {
    for (const url of floorPlan.imageUrls) {
      if (!metadataByUrl.has(url)) {
        metadataByUrl.set(url, {
          url,
          name: floorPlan.name || null,
          monthlyRent: floorPlan.monthlyRent,
          roomSizeSqFt: floorPlan.roomSizeSqFt,
        });
      }
    }
  }

  return (diagrams[layoutKey] ?? []).map((url) => {
    const matched = metadataByUrl.get(url);
    return matched ?? {
      url,
      name: null,
      monthlyRent: null,
      roomSizeSqFt: null,
    };
  });
}

export function FloorPlanDiagramsView({ diagrams, floorPlans = [], showRentCard = false }: FloorPlanDiagramsViewProps) {
  // Filter to only categories that have images
  const availableCategories = diagramCategories.filter(
    (c) => (diagrams[c.value]?.length ?? 0) > 0
  );

  const [activeTab, setActiveTab] = useState(
    availableCategories.length > 0 ? availableCategories[0].value : ""
  );
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (availableCategories.length === 0) {
    return null;
  }

  const activeCards = getImageCards(floorPlans, diagrams, activeTab);

  return (
    <>
      <section className="content-wrap pt-10">
        <div className="glass-panel rounded-[2rem] p-5 sm:p-8">
          <div className="mb-2">
            <p className="text-sm text-slate-500">户型概览</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              户型图
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              点击图片可放大查看详细户型布局
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const isActive = activeTab === category.value;
              const price = formatPriceRange(getPriceSummary(floorPlans, category.value));
              const sqft = getSqftRange(floorPlans, category.value);
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveTab(category.value)}
                  className={[
                    "rounded-full border px-5 py-2.5 text-left transition-all",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-md"
                      : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white"
                  ].join(" ")}
                >
                  <span className="block text-sm font-medium">{category.label}</span>
                  {(price || sqft) && (
                    <span className={["block text-xs mt-0.5", isActive ? "text-white/70" : "text-slate-400"].join(" ")}>
                      {[price, sqft].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Diagrams Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCards.map((card, index) => (
              <button
                key={`${card.url}-${index}`}
                type="button"
                onClick={() => setLightboxUrl(card.url)}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2 text-left transition-all hover:border-slate-300 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden rounded-[1rem] bg-slate-50">
                  <Image
                    src={optimizeCloudinaryUrl(card.url, "c_fit,h_500,f_auto,q_auto")}
                    alt={`户型图 ${index + 1}`}
                    fill
                    className="object-contain transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-slate-950/0 transition group-hover:bg-slate-950/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition group-hover:opacity-100">
                    <ZoomIn className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-3 rounded-[1rem] bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {card.name ?? "该户型"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {card.monthlyRent !== null
                          ? `$${card.monthlyRent.toLocaleString()} / 月`
                          : "价格待补充"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {card.roomSizeSqFt ? `${card.roomSizeSqFt} sq.ft` : "面积待补充"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {showRentCard && (
        <section className="content-wrap pt-4">
          <div className="glass-panel rounded-[2rem] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-900">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-500">月租金</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {(() => {
                    const summary = getPriceSummary(floorPlans, activeTab);
                    const range = formatPriceRange(summary);
                    return range ? `US$ ${range.replace(/\$/g, "")} / 月` : "价格待定";
                  })()}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {(() => {
                    const summary = getPriceSummary(floorPlans, activeTab);
                    const activeLabel =
                      diagramCategories.find((category) => category.value === activeTab)?.label ?? "当前户型";

                    if (!summary) {
                      return `${activeLabel} 还没有录入价格。`;
                    }

                    if (summary.count === 1) {
                      return `当前只录入了 1 条 ${activeLabel} 价格；新增更多 ${activeLabel} 户型后，这里会自动显示最低价到最高价。`;
                    }

                    return `按当前 ${activeLabel} 分类下 ${summary.count} 条户型记录，自动显示最低价到最高价。`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={optimizeCloudinaryUrl(lightboxUrl, "c_fit,w_1400,f_auto,q_auto")}
              alt="户型图大图"
              className="max-h-[85vh] w-auto rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white transition hover:bg-slate-950"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
