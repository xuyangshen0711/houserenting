"use client";

import { useMemo, useState } from "react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-optimization";
import type { AdminListingRecord, FloorPlanSource } from "@/lib/listing-view-model";

type AdminFloorPlanManagerProps = {
  property: AdminListingRecord;
  onClose: () => void;
  onUpdate: () => void;
};

type FloorPlanState = {
  id?: string;
  name: string;
  layout: string;
  monthlyRent: string;
  roomSizeSqFt: string;
  isFurnished: boolean;
  imageUrls: string[];
};

const initialFloorPlanState: FloorPlanState = {
  name: "",
  layout: "ONE_BED_ONE_BATH",
  monthlyRent: "",
  roomSizeSqFt: "",
  isFurnished: false,
  imageUrls: []
};

const layoutSections = [
  { value: "STUDIO", label: "Studio", shortLabel: "Studio" },
  { value: "ONE_BED_ONE_BATH", label: "1 Bedroom", shortLabel: "1B" },
  { value: "ONE_BED_DEN", label: "1 Bed + Den", shortLabel: "1B+Den" },
  { value: "TWO_BED_TWO_BATH", label: "2 Bedroom", shortLabel: "2B" },
  { value: "THREE_BED_TWO_BATH", label: "3 Bedroom", shortLabel: "3B" }
] as const;

const layoutLabels = Object.fromEntries(
  layoutSections.map((section) => [section.value, section.shortLabel])
) as Record<string, string>;

export function AdminFloorPlanManager({ property, onClose, onUpdate }: AdminFloorPlanManagerProps) {
  const [floorPlans, setFloorPlans] = useState<FloorPlanSource[]>(property.floorPlans);
  const [editingPlan, setEditingPlan] = useState<FloorPlanState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState<string>("ALL");

  const floorPlansByLayout = useMemo(() => {
    return layoutSections.map((section) => ({
      ...section,
      floorPlans: floorPlans
        .filter((plan) => plan.layout === section.value)
        .sort((a, b) => a.monthlyRent - b.monthlyRent)
    }));
  }, [floorPlans]);

  const visibleLayoutSections = useMemo(() => {
    return floorPlansByLayout.filter((section) =>
      selectedLayoutFilter === "ALL" ? section.floorPlans.length > 0 : section.value === selectedLayoutFilter
    );
  }, [floorPlansByLayout, selectedLayoutFilter]);

  function startCreate(layout = initialFloorPlanState.layout) {
    setEditingPlan({ ...initialFloorPlanState, layout });
    setStatus("");
  }

  function startEdit(fp: FloorPlanSource) {
    setEditingPlan({
      id: fp.id,
      name: fp.name,
      layout: fp.layout,
      monthlyRent: String(fp.monthlyRent),
      roomSizeSqFt: fp.roomSizeSqFt ? String(fp.roomSizeSqFt) : "",
      isFurnished: fp.isFurnished,
      imageUrls: fp.imageUrls
    });
    setStatus("");
  }

  function cancelEdit() {
    setEditingPlan(null);
    setStatus("");
  }

  function updateField<K extends keyof FloorPlanState>(field: K, value: FloorPlanState[K]) {
    if (!editingPlan) return;
    setEditingPlan((prev) => prev ? { ...prev, [field]: value } : null);
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除该户型吗？")) return;
    try {
      const res = await fetch(`/api/floor-plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setFloorPlans((prev) => prev.filter((fp) => fp.id !== id));
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlan) return;
    setStatus("");
    setIsSubmitting(true);

    const isEdit = !!editingPlan.id;
    const url = isEdit ? `/api/floor-plans/${editingPlan.id}` : `/api/floor-plans`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingPlan,
          propertyId: property.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "请求失败");

      if (isEdit) {
        setFloorPlans((prev) => prev.map((fp) => (fp.id === editingPlan.id ? data.floorPlan : fp)));
        setStatus("更新成功！");
      } else {
        setFloorPlans((prev) => [...prev, data.floorPlan]);
        setStatus("创建成功！");
      }

      setEditingPlan(null);
      setTimeout(() => setStatus(""), 3000);
      onUpdate();
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden mb-8 border border-slate-100 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <h2 className="text-2xl font-bold">{property.name} - 专属户型管理</h2>
           <p className="text-sm text-slate-500 mt-1">
             为该大楼配置其特有的子户型 (Floor plans)。当前已有 {floorPlans.length} 个户型。
           </p>
        </div>
        <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-800 rounded-full text-sm font-medium hover:bg-slate-300 transition-colors">
          返回大楼列表
        </button>
      </div>

      <div className="p-6">
        {status && <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 text-sm">{status}</div>}
        
        {!editingPlan ? (
          <div>
            <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">按户型分类管理</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    先选分类再录入，会比从一堆户型里翻找更顺手。用户前台看到的 Studio、1B、2B、3B 也会更统一。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layoutSections.map((section) => (
                    <button
                      key={`quick-create-${section.value}`}
                      type="button"
                      onClick={() => startCreate(section.value)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                      + 新增 {section.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-lg font-semibold">现有户型列表</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLayoutFilter("ALL")}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    selectedLayoutFilter === "ALL"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                >
                  全部
                </button>
                {layoutSections.map((section) => {
                  const count = floorPlansByLayout.find((item) => item.value === section.value)?.floorPlans.length ?? 0;
                  return (
                    <button
                      key={`filter-${section.value}`}
                      type="button"
                      onClick={() => setSelectedLayoutFilter(section.value)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        selectedLayoutFilter === section.value
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      ].join(" ")}
                    >
                      {section.shortLabel} · {count}
                    </button>
                  );
                })}
              </div>
            </div>

            {floorPlans.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 mb-4">当前尚未添加任何户型数据。</p>
              </div>
            ) : (
              <div className="space-y-8">
                {visibleLayoutSections.map((section) => (
                  <section key={section.value}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-slate-950">{section.label}</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          当前 {section.floorPlans.length} 个 {section.shortLabel} 户型
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startCreate(section.value)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        + 新增 {section.shortLabel}
                      </button>
                    </div>

                    {section.floorPlans.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-400">
                        这个分类下还没有户型，点击右上角即可新增。
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {section.floorPlans.map((fp) => (
                          <div key={fp.id} className="relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 group">
                            <div className="mb-1 text-lg font-bold">{fp.name || "未命名"}</div>
                            <div className="mb-4 text-sm text-slate-500">
                               <span className="mr-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">{layoutLabels[fp.layout]}</span>
                               ${fp.monthlyRent} / 月 {fp.roomSizeSqFt ? `· ${fp.roomSizeSqFt} sq.ft` : ""}
                            </div>
                            {fp.imageUrls.length > 0 ? (
                              <div className="mb-4 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                                <img src={optimizeCloudinaryUrl(fp.imageUrls[0], "c_fill,h_300,f_auto,q_auto")} alt="封面" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="mb-4 flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">无图片</div>
                            )}
                            <div className="flex gap-2">
                               <button onClick={() => startEdit(fp)} className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">编辑</button>
                               <button onClick={() => handleDelete(fp.id)} className="flex-1 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100">删除</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-2">
            <h3 className="text-xl font-bold mb-6">
               {editingPlan.id ? "编辑户型" : "新增户型"}
            </h3>
            
            <div className="grid gap-5 md:grid-cols-2 mb-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">户型标语或名称 (如 1B1B Courtyard View)</span>
                <input required value={editingPlan.name} onChange={(e) => updateField("name", e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900" />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">户型分类</span>
                <select value={editingPlan.layout} onChange={(e) => updateField("layout", e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900">
                  {layoutSections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label} ({section.shortLabel})
                    </option>
                  ))}
                </select>
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">月租金 ($)</span>
                <input required type="number" min="0" value={editingPlan.monthlyRent} onChange={(e) => updateField("monthlyRent", e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900" />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">面积 (sq.ft) - 可选</span>
                <input type="number" min="0" value={editingPlan.roomSizeSqFt} onChange={(e) => updateField("roomSizeSqFt", e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900" />
              </label>
            </div>

            <label className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border">
              <input type="checkbox" checked={editingPlan.isFurnished} onChange={(e) => updateField("isFurnished", e.target.checked)} className="w-5 h-5 accent-slate-900" />
              <span className="text-sm font-medium">包含家具 (Furnished)</span>
            </label>

            <div className="mb-8 p-6 bg-white rounded-2xl border">
               <h4 className="text-sm font-medium text-slate-700 mb-4">上传该户型的室内外照片</h4>
               <CloudinaryUploader value={editingPlan.imageUrls} onChange={(urls) => updateField("imageUrls", urls)} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
               <button type="button" onClick={cancelEdit} className="px-6 py-3 rounded-full border bg-white font-medium"> 取消 </button>
               <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-950 px-8 py-3 text-white font-medium">
                  {isSubmitting ? "正在保存中..." : "保存户型"}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
