"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  LayoutDashboard,
  PencilLine,
  Power,
  Search,
  Trash2,
  X
} from "lucide-react";
import { AdminListingForm } from "@/components/admin-listing-form";
import { AdminFloorPlanManager } from "@/components/admin-floorplan-manager";
import {
  getAreaLabel,
  getPetPolicyLabel,
  getSchoolDisplayLabel,
  type AdminListingRecord
} from "@/lib/listing-view-model";

type AdminDashboardProps = {
  initialListings: AdminListingRecord[];
  databaseReady: boolean;
  initialStatus?: string;
};

export function AdminDashboard({
  initialListings,
  databaseReady,
  initialStatus = ""
}: AdminDashboardProps) {
  const [listings, setListings] = useState(initialListings);
  const [managingFloorPlansFor, setManagingFloorPlansFor] =
    useState<AdminListingRecord | null>(null);
  const [editingListingFull, setEditingListingFull] =
    useState<AdminListingRecord | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [pendingId, setPendingId] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const deferredListingSearch = useDeferredValue(listingSearch);

  const summary = useMemo(() => {
    const published = listings.filter((listing) => listing.isPublished).length;
    const missingImages = listings.filter(
      (listing) => listing.imageUrls.length === 0
    ).length;

    return {
      total: listings.length,
      published,
      hidden: listings.length - published,
      missingImages
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const normalizedSearch = deferredListingSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return listings;
    }

    return listings.filter((listing) => {
      const searchableText = [
        listing.name,
        listing.address,
        listing.slug,
        getAreaLabel(listing.area)
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [deferredListingSearch, listings]);

  const filteredIncompleteListings = useMemo(
    () => filteredListings.filter((listing) => listing.imageUrls.length === 0),
    [filteredListings]
  );

  function syncListingFloorPlans(
    id: string,
    nextFloorPlans: AdminListingRecord["floorPlans"]
  ) {
    setListings((current) =>
      current.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              floorPlans: nextFloorPlans
            }
          : listing
      )
    );

    setManagingFloorPlansFor((current) =>
      current && current.id === id
        ? {
            ...current,
            floorPlans: nextFloorPlans
          }
        : current
    );
  }

  async function handleDelete(id: string) {
    const target = listings.find((listing) => listing.id === id);

    if (
      !target ||
      !window.confirm(`确定删除「${target.name}」吗？此操作无法撤销。`)
    ) {
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
      if (editingListingFull?.id === id) {
        setEditingListingFull(null);
      }
      setStatus("公寓已删除。");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !listing.isPublished })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "更新状态失败");
      }

      setListings((current) =>
        current.map((item) =>
          item.id === listing.id
            ? { ...item, isPublished: result.listing.isPublished }
            : item
        )
      );

      if (editingListingFull?.id === listing.id) {
        setEditingListingFull(result.listing);
      }

      setStatus(
        result.listing.isPublished
          ? "房源已上架。"
          : "房源已下架。"
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "更新状态失败");
    } finally {
      setPendingId("");
    }
  }

  if (managingFloorPlansFor) {
    return (
      <AdminFloorPlanManager
        property={managingFloorPlansFor}
        onClose={() => setManagingFloorPlansFor(null)}
        onUpdate={(nextFloorPlans) =>
          syncListingFloorPlans(managingFloorPlansFor.id, nextFloorPlans)
        }
      />
    );
  }

  if (editingListingFull) {
    return (
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div>
            <h2 className="text-2xl font-bold">
              {editingListingFull.name}
              {" "}
              - 编辑大楼信息
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              修改基础资料后会立即保存到数据库。
            </p>
          </div>
          <button
            onClick={() => setEditingListingFull(null)}
            className="rounded-full bg-slate-200 px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300"
          >
            返回列表
          </button>
        </div>

        <div className="p-6">
          <AdminListingForm
            initialData={editingListingFull}
            onCancelEdit={() => setEditingListingFull(null)}
            onSuccess={(listing) => {
              setListings((current) =>
                current.map((item) => (item.id === listing.id ? listing : item))
              );
              setEditingListingFull(null);
              setStatus("公寓已更新。");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">总公寓数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {summary.total}
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">已展示</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {summary.published}
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">未展示</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {summary.hidden}
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">缺少主图</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {summary.missingImages}
          </p>
        </div>
      </div>

      {filteredIncompleteListings.length ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label text-amber-700">待补全</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950">
                {filteredIncompleteListings.length}
                {" "}
                个房源缺少主图
              </h2>
              <p className="mt-3 text-sm leading-6 text-amber-900/80">
                这些房源已经入库，但暂时不适合发布。点进编辑页上传主图后，图片会自动写回数据库。
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredIncompleteListings.map((listing) => (
              <div
                key={`incomplete-${listing.id}`}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-amber-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    {listing.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getAreaLabel(listing.area)}
                    {" "}
                    /{" "}
                    {listing.address}
                  </p>
                  <p className="mt-2 text-sm font-bold text-amber-700">
                    缺少主图，请点击上传
                  </p>
                </div>

                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                >
                  去上传主图
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!databaseReady ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          尚未检测到
          {" "}
          <code>DATABASE_URL</code>
          ，请先配置 PostgreSQL 和 Prisma。
        </div>
      ) : null}

      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">公寓列表</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              已录入房源
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              新建表单已经单独放到新页面，这里专心看列表和管理状态。
            </p>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-3 lg:items-end">
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}

            <div className="flex w-full items-center gap-3">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={listingSearch}
                  onChange={(event) => setListingSearch(event.target.value)}
                  placeholder="搜索公寓名、地址或 slug"
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <button
                type="button"
                onClick={() => setListingSearch("")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                清空
              </button>
            </div>

            <p className="text-xs font-light tracking-wide text-slate-400">
              当前显示
              {" "}
              {filteredListings.length}
              {" "}
              /{" "}
              {listings.length}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredListings.length ? (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="glass-panel rounded-[2rem] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold text-slate-950">
                        {listing.name}
                      </h3>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          listing.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        ].join(" ")}
                      >
                        {listing.isPublished ? "已展示" : "未展示"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {getAreaLabel(listing.area)}
                      {" "}
                      /{" "}
                      {listing.address}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-800">
                      户型数：
                      {" "}
                      {listing.floorPlans?.length || 0}
                      {" "}
                      /{" "}
                      {listing.hasBrokerFee ? "有中介费" : "无中介费"}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {listing.description}
                    </p>

                    {listing.promotions ? (
                      <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          当前优惠
                        </p>
                        <p className="mt-2 text-sm leading-6 text-emerald-950">
                          {listing.promotions}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        图片：
                        {" "}
                        {listing.imageUrls.length}
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
                        Slug:
                        {" "}
                        {listing.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setManagingFloorPlansFor(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      管理户型
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingListingFull(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <PencilLine className="h-4 w-4" />
                      编辑
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleTogglePublish(listing)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <Power className="h-4 w-4" />
                      {listing.isPublished ? "下架" : "上架"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(listing.id)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
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
              <p className="text-lg font-semibold text-slate-950">
                {listingSearch.trim() ? "没有匹配的公寓" : "还没有房源"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {listingSearch.trim()
                  ? "试试其他关键词。"
                  : "点击顶部的新建公寓按钮即可开始录入。"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
