"use client";

import { useEffect, useState } from "react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import {
  supportedSchoolLabels,
  type AdminListingRecord
} from "@/lib/listing-view-model";

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

function getFormStateFromListing(
  listing: AdminListingRecord
): AdminListingFormState {
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

  function toggleSchool(school: string) {
    updateField(
      "nearbySchools",
      form.nearbySchools.includes(school)
        ? form.nearbySchools.filter((item) => item !== school)
        : [...form.nearbySchools, school]
    );
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

      if (!response.ok) {
        throw new Error(result.message ?? "提交失败");
      }

      const mode = initialData ? "edit" : "create";
      setStatus(
        mode === "create"
          ? form.imageUrls.length
            ? "公寓已保存。"
            : "公寓已入库，后面再补主图也可以。"
          : "公寓已更新。"
      );

      if (!initialData) {
        setForm(initialState);
      }

      onSuccess?.(result.listing, mode);
    } catch (submitError) {
      setStatus(submitError instanceof Error ? submitError.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h3 className="mb-4 text-xl font-bold">基本信息</h3>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              大楼名称
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              页面链接名（Slug）
            </span>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="可留空，系统会自动生成"
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            />
            <p className="mt-2 text-sm leading-6 text-slate-500">
              例如
              {" "}
              <code>/listings/mason-everett</code>
              。
            </p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              详细地址
            </span>
            <input
              required
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              所属区域
            </span>
            <select
              value={form.area}
              onChange={(e) => updateField("area", e.target.value)}
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            >
              <option value="BACK_BAY">Back Bay</option>
              <option value="BEACON_HILL">Beacon Hill</option>
              <option value="SEAPORT">Seaport</option>
              <option value="SOUTH_END">South End</option>
              <option value="CHELSEA">Chelsea</option>
              <option value="BRIGHTON">Brighton</option>
              <option value="EVERETT">Everett</option>
              <option value="MALDEN">Malden</option>
              <option value="ALLSTON">Allston</option>
              <option value="CAMBRIDGE">Cambridge</option>
              <option value="SOMERVILLE">Somerville</option>
              <option value="BROOKLINE">Brookline</option>
              <option value="BOSTON">Boston</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
            <span className="text-sm font-medium">包含中介费</span>
            <input
              type="checkbox"
              checked={form.hasBrokerFee}
              onChange={(e) => updateField("hasBrokerFee", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
            <span className="text-sm font-medium">上架展示</span>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => updateField("isPublished", e.target.checked)}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              宠物政策
            </span>
            <select
              value={form.petPolicy}
              onChange={(e) => updateField("petPolicy", e.target.value)}
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            >
              <option value="OPEN">不限</option>
              <option value="CATS_ONLY">仅猫</option>
              <option value="CATS_AND_DOGS">猫狗均可</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              车位费
            </span>
            <input
              value={form.parkingFee}
              onChange={(e) => updateField("parkingFee", e.target.value)}
              placeholder="可选，按月填写"
              className="w-full rounded-2xl border bg-white/85 px-4 py-3 outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="flex items-center justify-between rounded-[1.5rem] border bg-white/70 px-4 py-4">
            <span className="text-sm font-medium">接受本科生</span>
            <input
              type="checkbox"
              checked={form.acceptsUndergrad}
              onChange={(e) => updateField("acceptsUndergrad", e.target.checked)}
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              当前优惠
            </span>
            <textarea
              value={form.promotions}
              onChange={(e) => updateField("promotions", e.target.value)}
              rows={4}
              placeholder="可选，填写 leasing promotion"
              className="w-full rounded-[1.5rem] border bg-white/85 px-4 py-3 outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              交通信息
            </span>
            <textarea
              value={form.transitInfo}
              onChange={(e) => updateField("transitInfo", e.target.value)}
              rows={3}
              placeholder="填写 Transit Score、Walk Score、班车等信息"
              className="w-full rounded-[1.5rem] border bg-white/85 px-4 py-3 outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              房源描述
            </span>
            <textarea
              required
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              placeholder="填写大楼介绍"
              className="w-full rounded-[1.5rem] border bg-white/85 px-4 py-3 outline-none"
            />
          </label>
        </div>

        <div className="mt-5 rounded-[1.5rem] border bg-white/70 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">附近学校</p>
              <p className="text-sm leading-6 text-slate-500">
                选择和该房源有关联的学校。
              </p>
            </div>
            <p className="text-xs font-medium tracking-wide text-slate-400">
              已选择
              {" "}
              {form.nearbySchools.length}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {supportedSchoolLabels.map((school) => {
              const isSelected = form.nearbySchools.includes(school);

              return (
                <button
                  key={school}
                  type="button"
                  onClick={() => toggleSchool(school)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {school}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <CloudinaryUploader
            value={form.imageUrls}
            onChange={(value) =>
              void syncAssetField(
                "imageUrls",
                value,
                "主图已保存到数据库。"
              )
            }
          />
          <p className="mt-3 text-sm text-slate-500">
            可以先不上传主图直接入库，后面再补。没有主图的房源会保持未发布状态。
          </p>
          {initialData ? (
            <p className="mt-3 text-sm text-slate-500">
              编辑已有房源时，图片变更会自动保存。
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}

        <div className="flex gap-3">
          {initialData && onCancelEdit ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full border bg-white px-5 py-3"
            >
              取消编辑
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isSyncingAssets}
            className="rounded-full bg-slate-950 px-5 py-3 text-white"
          >
            {isSubmitting
              ? "保存中..."
              : isSyncingAssets
                ? "同步图片中..."
                : "保存大楼"}
          </button>
        </div>
      </div>
    </form>
  );
}
