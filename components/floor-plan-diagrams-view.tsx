"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-optimization";
import type { FloorPlanViewModel } from "@/lib/listing-view-model";

type FloorPlanDiagramsViewProps = {
  diagrams: Record<string, string[]>;
  floorPlans?: FloorPlanViewModel[];
};

const diagramCategories = [
  { value: "STUDIO", label: "Studio" },
  { value: "ONE_BED_ONE_BATH", label: "1B" },
  { value: "ONE_BED_DEN", label: "1B+Den" },
  { value: "TWO_BED_TWO_BATH", label: "2B" },
  { value: "THREE_BED_TWO_BATH", label: "3B" }
] as const;

// Map layout key → layout label from floor plan records
const LAYOUT_KEY_MAP: Record<string, string> = {
  STUDIO: "Studio",
  ONE_BED_ONE_BATH: "1B",
  ONE_BED_DEN: "1B+Den",
  TWO_BED_TWO_BATH: "2B",
  THREE_BED_TWO_BATH: "3B",
};

function getPriceRange(floorPlans: FloorPlanViewModel[], layoutKey: string): string | null {
  const label = LAYOUT_KEY_MAP[layoutKey];
  if (!label) return null;
  const matching = floorPlans.filter((fp) => fp.layoutLabel === label);
  if (matching.length === 0) return null;
  const rents = matching.map((fp) => fp.monthlyRent);
  const min = Math.min(...rents);
  const max = Math.max(...rents);
  return min === max ? `$${min.toLocaleString()}` : `$${min.toLocaleString()} – $${max.toLocaleString()}`;
}

function getSqftRange(floorPlans: FloorPlanViewModel[], layoutKey: string): string | null {
  const label = LAYOUT_KEY_MAP[layoutKey];
  if (!label) return null;
  const sqfts = floorPlans
    .filter((fp) => fp.layoutLabel === label && fp.roomSizeSqFt)
    .map((fp) => fp.roomSizeSqFt!);
  if (sqfts.length === 0) return null;
  const min = Math.min(...sqfts);
  const max = Math.max(...sqfts);
  return min === max ? `${min} sq.ft` : `${min}–${max} sq.ft`;
}

export function FloorPlanDiagramsView({ diagrams, floorPlans = [] }: FloorPlanDiagramsViewProps) {
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

  const activeUrls = diagrams[activeTab] ?? [];

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
              const price = getPriceRange(floorPlans, category.value);
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
            {activeUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxUrl(url)}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2 transition-all hover:border-slate-300 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden rounded-[1rem] bg-slate-50">
                  <Image
                    src={optimizeCloudinaryUrl(url, "c_fit,h_500,f_auto,q_auto")}
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
              </button>
            ))}
          </div>
        </div>
      </section>

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
