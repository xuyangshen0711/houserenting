"use client";

import { useState } from "react";
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

// Map Prisma LayoutType to standard UI strings
const layoutLabels: Record<string, string> = {
  STUDIO: "Studio",
  ONE_BED_ONE_BATH: "1B1B",
  TWO_BED_TWO_BATH: "2B2B",
  THREE_BED_TWO_BATH: "3B2B"
};

export function AdminFloorPlanManager({ property, onClose, onUpdate }: AdminFloorPlanManagerProps) {
  const [floorPlans, setFloorPlans] = useState<FloorPlanSource[]>(property.floorPlans);
  const [editingPlan, setEditingPlan] = useState<FloorPlanState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  function startCreate() {
    setEditingPlan({ ...initialFloorPlanState });
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
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold">现有户型列表</h3>
              <button onClick={startCreate} className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                + 新增户型
              </button>
            </div>

            {floorPlans.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 mb-4">当前尚未添加任何户型数据。</p>
                <button onClick={startCreate} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 shadow-sm rounded-full text-sm font-medium hover:bg-slate-50">
                  立即创建第一个户型
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {floorPlans.map((fp) => (
                  <div key={fp.id} className="relative p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all bg-white group">
                    <div className="font-bold text-lg mb-1">{fp.name || "未命名"}</div>
                    <div className="text-sm text-slate-500 mb-4">
                       <span className="inline-block bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-semibold mr-2">{layoutLabels[fp.layout]}</span>
                       ${fp.monthlyRent} / 月 {fp.roomSizeSqFt ? `· ${fp.roomSizeSqFt} sq.ft` : ""}
                    </div>
                    {fp.imageUrls.length > 0 ? (
                      <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                        <img src={optimizeCloudinaryUrl(fp.imageUrls[0], "c_fill,h_300,f_auto,q_auto")} alt="封面" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200">无图片</div>
                    )}
                    <div className="flex gap-2">
                       <button onClick={() => startEdit(fp)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 text-slate-700">编辑</button>
                       <button onClick={() => handleDelete(fp.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">删除</button>
                    </div>
                  </div>
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
                <span className="mb-2 block text-sm font-medium text-slate-700">户型结构 (Layout)</span>
                <select value={editingPlan.layout} onChange={(e) => updateField("layout", e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="STUDIO">Studio</option>
                  <option value="ONE_BED_ONE_BATH">1B1B</option>
                  <option value="TWO_BED_TWO_BATH">2B2B</option>
                  <option value="THREE_BED_TWO_BATH">3B2B</option>
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
