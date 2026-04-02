"use client";

import { useMemo, useState } from "react";
import { PencilLine, Power, Trash2 } from "lucide-react";
import { AdminListingForm } from "@/components/admin-listing-form";
import {
  getAreaLabel,
  getLayoutLabel,
  getPetPolicyLabel,
  getSchoolDisplayLabel,
  type AdminListingRecord
} from "@/lib/listing-view-model";

type AdminDashboardProps = {
  initialListings: AdminListingRecord[];
  databaseReady: boolean;
};

export function AdminDashboard({
  initialListings,
  databaseReady
}: AdminDashboardProps) {
  const [listings, setListings] = useState(initialListings);
  const [editingListing, setEditingListing] = useState<AdminListingRecord | null>(
    null
  );
  const [status, setStatus] = useState("");
  const [pendingId, setPendingId] = useState("");

  const summary = useMemo(() => {
    const published = listings.filter((listing) => listing.isPublished).length;
    return {
      total: listings.length,
      published,
      hidden: listings.length - published
    };
  }, [listings]);

  async function handleDelete(id: string) {
    const target = listings.find((listing) => listing.id === id);

    if (!target || !window.confirm(`确定删除「${target.title}」吗？这个操作无法撤销。`)) {
      return;
    }

    setPendingId(id);
    setStatus("");

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "删除失败");
      }

      setListings((current) => current.filter((listing) => listing.id !== id));
      if (editingListing?.id === id) {
        setEditingListing(null);
      }
      setStatus("房源已删除。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "删除失败");
    } finally {
      setPendingId("");
    }
  }

  async function handleTogglePublish(listing: AdminListingRecord) {
    setPendingId(listing.id);
    setStatus("");

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isPublished: !listing.isPublished
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "更新状态失败");
      }

      setListings((current) =>
        current.map((item) => (item.id === listing.id ? result.listing : item))
      );
      if (editingListing?.id === listing.id) {
        setEditingListing(result.listing);
      }
      setStatus(
        result.listing.isPublished ? "房源已上架。" : "房源已下架，前台将不再显示。"
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "更新状态失败");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">房源总数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.total}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">已上架</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.published}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">未上架</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.hidden}</p>
        </div>
      </div>

      {!databaseReady ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          还没有检测到 `DATABASE_URL`。你可以先看界面，但要真正管理房源，需要先在 Render
          或本地环境中配置 PostgreSQL，并执行 Prisma 迁移。
        </div>
      ) : null}

      <section>
        <div className="max-w-3xl">
          <p className="section-label">{editingListing ? "编辑房源" : "新增房源"}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {editingListing ? `正在编辑：${editingListing.title}` : "录入一套新的精选房源"}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            这里的保存会直接写入数据库。编辑后的变更会同步影响首页和详情页展示。
          </p>
        </div>

        <div className="mt-6">
          <AdminListingForm
            initialData={editingListing}
            onCancelEdit={() => setEditingListing(null)}
            onSuccess={(listing, mode) => {
              setListings((current) => {
                if (mode === "create") {
                  return [listing, ...current];
                }

                return current.map((item) => (item.id === listing.id ? listing : item));
              });
              setEditingListing(null);
              setStatus(mode === "create" ? "房源已新增。" : "房源已更新。");
            }}
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">房源管理</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              已录入房源
            </h2>
          </div>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </div>

        <div className="mt-6 space-y-4">
          {listings.length ? (
            listings.map((listing) => (
              <div
                key={listing.id}
                className="glass-panel rounded-[2rem] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold text-slate-950">
                        {listing.title}
                      </h3>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          listing.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        ].join(" ")}
                      >
                        {listing.isPublished ? "已上架" : "未上架"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {getAreaLabel(listing.area)} · {getLayoutLabel(listing.layout)} ·{" "}
                      {listing.address}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">
                      US$ {listing.monthlyRent.toLocaleString()} / 月
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {listing.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        图片 {listing.imageUrls.length} 张
                      </span>
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        视频 {listing.videoUrls.length} 段
                      </span>
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        {getPetPolicyLabel(listing.petPolicy)}
                      </span>
                      {listing.nearbySchools.map((school) => (
                        <span
                          key={`${listing.id}-${school}`}
                          className="rounded-full bg-white/70 px-3 py-1"
                        >
                          {getSchoolDisplayLabel(school)}
                        </span>
                      ))}
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        Slug: {listing.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingListing(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      <PencilLine className="h-4 w-4" />
                      编辑
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleTogglePublish(listing)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
                    >
                      <Power className="h-4 w-4" />
                      {listing.isPublished ? "下架" : "上架"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(listing.id)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-[2rem] p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">还没有房源</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                你可以先在上面的表单里新增第一套房源。保存成功后，这里会立即出现。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
