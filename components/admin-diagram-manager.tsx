"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-optimization";
import type { AdminListingRecord } from "@/lib/listing-view-model";

type DiagramsByLayout = Record<string, string[]>;

const diagramCategories = [
  { value: "STUDIO", label: "Studio" },
  { value: "ONE_BED_ONE_BATH", label: "1B" },
  { value: "ONE_BED_DEN", label: "1B+Den" },
  { value: "TWO_BED_TWO_BATH", label: "2B" },
  { value: "THREE_BED_TWO_BATH", label: "3B" }
] as const;

type AdminDiagramManagerProps = {
  property: AdminListingRecord;
  onUpdate: (nextListing: AdminListingRecord) => void;
};

export function AdminDiagramManager({ property, onUpdate }: AdminDiagramManagerProps) {
  const [diagrams, setDiagrams] = useState<DiagramsByLayout>(
    (property.floorPlanDiagrams as DiagramsByLayout) ?? {}
  );
  const [activeTab, setActiveTab] = useState<string>(diagramCategories[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const activeUrls = diagrams[activeTab] ?? [];

  const persist = useCallback(
    async (nextDiagrams: DiagramsByLayout) => {
      setIsSaving(true);
      setStatus("");

      try {
        const response = await fetch(`/api/listings/${property.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ floorPlanDiagrams: nextDiagrams })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message ?? "保存失败");
        }

        setStatus("户型图已保存");
        onUpdate(result.listing);
        setTimeout(() => setStatus(""), 3000);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "保存失败");
      } finally {
        setIsSaving(false);
      }
    },
    [property.id, onUpdate]
  );

  function handleUpload(newUrls: string[]) {
    const nextDiagrams = {
      ...diagrams,
      [activeTab]: [...activeUrls, ...newUrls]
    };
    setDiagrams(nextDiagrams);
    void persist(nextDiagrams);
  }

  function handleRemove(url: string) {
    const nextUrls = activeUrls.filter((item) => item !== url);
    const nextDiagrams = { ...diagrams, [activeTab]: nextUrls };
    setDiagrams(nextDiagrams);
    void persist(nextDiagrams);
  }

  const totalCount = Object.values(diagrams).reduce(
    (acc, urls) => acc + (urls?.length ?? 0),
    0
  );

  return (
    <>
      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">户型图管理</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              按户型分类上传建筑平面图/户型图纸。上传后会自动保存并同步到前台详情页。当前共 {totalCount} 张。
            </p>
          </div>
          {isSaving && (
            <span className="text-sm text-slate-400 animate-pulse">正在保存...</span>
          )}
          {status && !isSaving && (
            <span className="text-sm text-emerald-600">{status}</span>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {diagramCategories.map((category) => {
            const count = diagrams[category.value]?.length ?? 0;
            const isActive = activeTab === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveTab(category.value)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                ].join(" ")}
              >
                {category.label}
                {count > 0 && (
                  <span className={[
                    "ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  ].join(" ")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Uploader for active tab */}
        <div className="mt-6">
          <CloudinaryUploader
            value={[]}
            onChange={(urls) => handleUpload(urls)}
            label={`上传 ${diagramCategories.find((c) => c.value === activeTab)?.label} 户型图`}
            description="拖入或选择户型图纸 (建筑平面图)，支持多张上传。"
            buttonLabel="选择户型图"
          />
        </div>

        {/* Preview grid for active tab */}
        {activeUrls.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeUrls.map((url) => (
              <div
                key={url}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2"
              >
                <div className="relative h-48 overflow-hidden rounded-[1rem] bg-slate-50">
                  <Image
                    src={optimizeCloudinaryUrl(url, "c_fit,h_400,f_auto,q_auto")}
                    alt="户型图"
                    fill
                    className="object-contain"
                    sizes="33vw"
                  />
                </div>
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeUrls.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-400">
              当前分类下还没有户型图，点击上方按钮上传。
            </p>
          </div>
        )}
      </div>

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
              src={optimizeCloudinaryUrl(lightboxUrl, "c_fit,w_1200,f_auto,q_auto")}
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
