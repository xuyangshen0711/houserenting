"use client";

import { useState } from "react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";

const initialState = {
  title: "",
  slug: "",
  monthlyRent: "",
  address: "",
  area: "BACK_BAY",
  layout: "ONE_BED_ONE_BATH",
  petPolicy: "OPEN",
  transitInfo: "",
  description: "",
  hasBrokerFee: false,
  isFurnished: true,
  imageUrls: [] as string[],
  videoUrls: [] as string[]
};

export function AdminListingForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof typeof initialState>(key: Key, value: (typeof initialState)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          monthlyRent: Number(form.monthlyRent)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "提交失败");
      }

      setStatus("房源已提交成功。");
      setForm(initialState);
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

        <div className="flex items-center gap-3">
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "提交中..." : "保存房源"}
          </button>
        </div>
      </div>
    </form>
  );
}
