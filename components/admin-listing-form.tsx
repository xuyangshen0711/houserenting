"use client";

import { useEffect, useState } from "react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import type { AdminListingRecord } from "@/lib/listing-view-model";

type AdminListingFormState = {
  title: string;
  slug: string;
  monthlyRent: string;
  address: string;
  area: string;
  nearbySchools: string[];
  layout: string;
  petPolicy: string;
  transitInfo: string;
  description: string;
  hasBrokerFee: boolean;
  isFurnished: boolean;
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
  title: "",
  slug: "",
  monthlyRent: "",
  address: "",
  area: "BACK_BAY",
  nearbySchools: [],
  layout: "ONE_BED_ONE_BATH",
  petPolicy: "OPEN",
  transitInfo: "",
  description: "",
  hasBrokerFee: false,
  isFurnished: true,
  isPublished: true,
  imageUrls: [],
  videoUrls: []
};

function getFormStateFromListing(listing: AdminListingRecord): AdminListingFormState {
  return {
    title: listing.title,
    slug: listing.slug,
    monthlyRent: String(listing.monthlyRent),
    address: listing.address,
    area: listing.area,
    nearbySchools: listing.nearbySchools,
    layout: listing.layout,
    petPolicy: listing.petPolicy,
    transitInfo: listing.transitInfo,
    description: listing.description,
    hasBrokerFee: listing.hasBrokerFee,
    isFurnished: listing.isFurnished,
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
  const schoolOptions = [
    { value: "Boston University", label: "Boston University (BU)" },
    { value: "Northeastern University", label: "Northeastern University" },
    { value: "Harvard University", label: "Harvard University" },
    {
      value: "Massachusetts Institute of Technology",
      label: "Massachusetts Institute of Technology (MIT)"
    },
    { value: "Tufts University", label: "Tufts University" },
    { value: "Boston College", label: "Boston College (BC)" },
    { value: "Emerson College", label: "Emerson College" },
    { value: "Suffolk University", label: "Suffolk University" },
    {
      value: "University of Massachusetts Boston",
      label: "University of Massachusetts Boston"
    },
    {
      value: "Massachusetts College of Art and Design",
      label: "Massachusetts College of Art and Design"
    },
    {
      value: "Wentworth Institute of Technology",
      label: "Wentworth Institute of Technology"
    },
    { value: "Wheelock College", label: "Wheelock College（已并入 BU）" },
    { value: "Berklee College of Music", label: "Berklee College of Music" },
    { value: "New England Conservatory", label: "New England Conservatory" },
    { value: "Lesley University", label: "Lesley University" },
    { value: "Cambridge College", label: "Cambridge College" },
    { value: "Babson College", label: "Babson College" },
    { value: "Brandeis University", label: "Brandeis University" },
    {
      value: "School of the Museum of Fine Arts at Tufts",
      label: "School of the Museum of Fine Arts at Tufts"
    },
    {
      value: "Boston Architectural College",
      label: "Boston Architectural College"
    }
  ];

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!form.imageUrls.length) {
      setStatus("请至少上传 1 张主图后再保存房源。");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...form,
      monthlyRent: Number(form.monthlyRent)
    };

    try {
      const endpoint = initialData ? `/api/listings/${initialData.id}` : "/api/listings";
      const method = initialData ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "提交失败");
      }

      const mode = initialData ? "edit" : "create";
      setStatus(mode === "create" ? "房源已提交成功。" : "房源已更新。");
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
    <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-5 sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">标题</span>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="例如：Back Bay 采光一居室"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">链接标识</span>
          <input
            required
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="back-bay-sunlit-1b1b"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">月租金</span>
          <input
            required
            type="number"
            min="0"
            value={form.monthlyRent}
            onChange={(event) => updateField("monthlyRent", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="3200"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">详细地址</span>
          <input
            required
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="例如：Boylston St, Boston, MA"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">所属区域</span>
          <select
            value={form.area}
            onChange={(event) => updateField("area", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
          >
            <option value="BACK_BAY">Back Bay</option>
            <option value="EVERETT">Everett</option>
            <option value="MALDEN">Malden</option>
            <option value="ALLSTON">Allston</option>
            <option value="CAMBRIDGE">Cambridge</option>
            <option value="SOMERVILLE">Somerville</option>
            <option value="BROOKLINE">Brookline</option>
          </select>
        </label>

        <div className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">附近大学</span>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
            <div className="flex flex-wrap gap-3">
              {schoolOptions.map((school) => {
                const checked = form.nearbySchools.includes(school.value);

                return (
                  <label
                    key={school.value}
                    className={[
                      "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                      checked
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={(event) =>
                        updateField(
                          "nearbySchools",
                          event.target.checked
                            ? [...form.nearbySchools, school.value]
                            : form.nearbySchools.filter((item) => item !== school.value)
                        )
                      }
                    />
                    <span>{school.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">房型</span>
          <select
            value={form.layout}
            onChange={(event) => updateField("layout", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
          >
            <option value="STUDIO">Studio（开间）</option>
            <option value="ONE_BED_ONE_BATH">1B1B</option>
            <option value="TWO_BED_TWO_BATH">2B2B</option>
            <option value="THREE_BED_TWO_BATH">3B2B</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">宠物政策</span>
          <select
            value={form.petPolicy}
            onChange={(event) => updateField("petPolicy", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
          >
            <option value="OPEN">不限</option>
            <option value="CATS_ONLY">仅猫</option>
            <option value="CATS_AND_DOGS">猫狗均可</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">交通信息</span>
          <input
            value={form.transitInfo}
            onChange={(event) => updateField("transitInfo", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="例如：步行 5 分钟到 Orange Line"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white/70 px-4 py-4">
          <span className="text-sm font-medium text-slate-700">是否有中介费</span>
          <input
            type="checkbox"
            checked={form.hasBrokerFee}
            onChange={(event) => updateField("hasBrokerFee", event.target.checked)}
            className="h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white/70 px-4 py-4">
          <span className="text-sm font-medium text-slate-700">是否带家具</span>
          <input
            type="checkbox"
            checked={form.isFurnished}
            onChange={(event) => updateField("isFurnished", event.target.checked)}
            className="h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white/70 px-4 py-4">
          <span className="text-sm font-medium text-slate-700">保存后立即上架</span>
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => updateField("isPublished", event.target.checked)}
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">长文描述</span>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full rounded-[1.5rem] border border-slate-200 bg-white/85 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="写下这套房源最打动人的地方，包括采光、装修、通勤、街区氛围等。"
          />
        </label>
      </div>

      <div className="mt-5">
        <CloudinaryUploader
          value={form.imageUrls}
          onChange={(nextValue) => updateField("imageUrls", nextValue)}
        />
      </div>

      <div className="mt-5">
        <CloudinaryUploader
          assetType="video"
          label="上传房源视频"
          description="支持多段视频上传。会直接发送到 Cloudinary，并返回视频 URL 列表。"
          buttonLabel="选择视频"
          value={form.videoUrls}
          onChange={(nextValue) => updateField("videoUrls", nextValue)}
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          <p>
            当前已上传 <span className="font-semibold text-slate-900">{form.imageUrls.length}</span> 张图片
          </p>
          <p className="mt-1">
            当前已上传 <span className="font-semibold text-slate-900">{form.videoUrls.length}</span> 段视频
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          {initialData ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700"
            >
              取消编辑
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "提交中..." : initialData ? "更新房源" : "保存房源"}
          </button>
        </div>
      </div>
    </form>
  );
}
