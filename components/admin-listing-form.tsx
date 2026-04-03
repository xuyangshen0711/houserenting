"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import type { AdminListingRecord } from "@/lib/listing-view-model";

type AdminListingFormState = {
  name: string;
  slug: string;
  address: string;
  area: string;
  nearbySchools: string[];
  petPolicy: string;
  acceptsUndergrad: boolean;
  parkingFee: string;
  promotions: string;
  transitInfo: string;
  description: string;
  hasBrokerFee: boolean;
  isPublished: boolean;
  imageUrls: string[];
  videoUrls: string[];
};

type AdminListingFormProps = {
  initialData?: AdminListingRecord | null;
  onSuccess?: (listing: AdminListingRecord, mode: "create" | "edit") => void;
  onCancelEdit?: () => void;
};

const initialState: AdminListingFormState = {
  name: "",
  slug: "",
  address: "",
  area: "BACK_BAY",
  nearbySchools: [],
  petPolicy: "OPEN",
  acceptsUndergrad: true,
  parkingFee: "",
  promotions: "",
  transitInfo: "",
  description: "",
  hasBrokerFee: false,
  isPublished: true,
  imageUrls: [],
  videoUrls: []
};

function getFormStateFromListing(listing: AdminListingRecord): AdminListingFormState {
  return {
    name: listing.name,
    slug: listing.slug,
    address: listing.address,
    area: listing.area,
    nearbySchools: listing.nearbySchools,
    petPolicy: listing.petPolicy,
    acceptsUndergrad: listing.acceptsUndergrad,
    parkingFee: listing.parkingFee ? String(listing.parkingFee) : "",
    promotions: listing.promotions || "",
    transitInfo: listing.transitInfo,
    description: listing.description,
    hasBrokerFee: listing.hasBrokerFee,
    isPublished: listing.isPublished,
    imageUrls: listing.imageUrls,
    videoUrls: listing.videoUrls
  };
}

export function AdminListingForm({
  initialData,
  onSuccess,
  onCancelEdit
}: AdminListingFormProps) {
  const [form, setForm] = useState<AdminListingFormState>(initialState);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingAssets, setIsSyncingAssets] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(getFormStateFromListing(initialData));
      setStatus("");
      return;
    }
    setForm(initialState);
    setStatus("");
  }, [initialData]);

  function updateField<Key extends keyof AdminListingFormState>(
    key: Key,
    value: AdminListingFormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function syncAssetField(
    key: "imageUrls" | "videoUrls",
    nextValue: string[],
    successMessage: string
  ) {
    updateField(key, nextValue);

    if (!initialData) {
      return;
    }

    setIsSyncingAssets(true);
    setStatus("");

    try {
      const response = await fetch(`/api/listings/${initialData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          [key]: nextValue
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "自动保存失败");
      }

      setForm(getFormStateFromListing(result.listing));
      setStatus(successMessage);
      onSuccess?.(result.listing, "edit");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "自动保存失败");
    } finally {
      setIsSyncingAssets(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!form.imageUrls.length) {
      setStatus("请至少上传 1 张大楼/公寓照片。");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = initialData ? `/api/listings/${initialData.id}` : "/api/listings";
      const method = initialData ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message ?? "提交失败");

      const mode = initialData ? "edit" : "create";
      setStatus(mode === "create" ? "大楼信息已提交成功。" : "大楼信息已更新。");
      if (!initialData) setForm(initialState);
      onSuccess?.(result.listing, mode);
    } catch (submitError) {
      setStatus(submitError instanceof Error ? submitError.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel p-5 sm:p-8 rounded-[2rem]">
        <h3 className="text-xl font-bold mb-4">基本信息 (Property)</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">大楼/公寓名称</span>
            <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">唯一标识符 (Slug)</span>
            <input required value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">详细地址</span>
            <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">所属区域</span>
            <select value={form.area} onChange={(e) => updateField("area", e.target.value)} className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none">
              <option value="BACK_BAY">Back Bay</option>
              <option value="EVERETT">Everett</option>
              <option value="MALDEN">Malden</option>
              <option value="ALLSTON">Allston</option>
              <option value="CAMBRIDGE">Cambridge</option>
              <option value="BROOKLINE">Brookline</option>
            </select>
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-3 mt-5">
           <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
              <span className="text-sm font-medium">包含中介费</span>
              <input type="checkbox" checked={form.hasBrokerFee} onChange={(e) => updateField("hasBrokerFee", e.target.checked)} />
           </label>
           <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
              <span className="text-sm font-medium">接受本科生</span>
              <input type="checkbox" checked={form.acceptsUndergrad} onChange={(e) => updateField("acceptsUndergrad", e.target.checked)} />
           </label>
           <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
              <span className="text-sm font-medium">上架展示</span>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => updateField("isPublished", e.target.checked)} />
           </label>
        </div>
        <div className="mt-5">
           <CloudinaryUploader
             value={form.imageUrls}
             onChange={(v) =>
               void syncAssetField("imageUrls", v, "主图已自动保存到数据库。")
             }
           />
           {initialData ? (
             <p className="mt-3 text-sm text-slate-500">
               上传或删除主图后会自动同步到当前房源，不需要额外点击保存。
             </p>
           ) : null}
        </div>
        {initialData ? (
          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-medium text-slate-800">当前编辑入口</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              缺主图的房源会在后台“待补全”列表中直接跳转到这里。
            </p>
            <Link
              href={`/admin/listings/${initialData.id}`}
              className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              打开独立编辑页
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
         {status && <p className="text-sm text-slate-600">{status}</p>}
         <div className="flex gap-3">
           {initialData && onCancelEdit ? <button type="button" onClick={onCancelEdit} className="px-5 py-3 rounded-full border bg-white">取消编辑</button> : null}
           <button type="submit" disabled={isSubmitting || isSyncingAssets} className="rounded-full bg-slate-950 px-5 py-3 text-white">{isSubmitting ? "处理中..." : isSyncingAssets ? "正在同步图片..." : "保存建筑记录"}</button>
         </div>
      </div>
    </form>
  );
}
