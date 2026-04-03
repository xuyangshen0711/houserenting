"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PencilLine, Power, Trash2, LayoutDashboard } from "lucide-react";
import { AdminListingForm } from "@/components/admin-listing-form";
import { AdminFloorPlanManager } from "@/components/admin-floorplan-manager";
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
  const [managingFloorPlansFor, setManagingFloorPlansFor] = useState<AdminListingRecord | null>(null);
  const [status, setStatus] = useState("");
  const [pendingId, setPendingId] = useState("");

  const summary = useMemo(() => {
    const published = listings.filter((listing) => listing.isPublished).length;
    const missingImages = listings.filter((listing) => listing.imageUrls.length === 0).length;
    return {
      total: listings.length,
      published,
      hidden: listings.length - published,
      missingImages
    };
  }, [listings]);

  const incompleteListings = useMemo(
    () => listings.filter((listing) => listing.imageUrls.length === 0),
    [listings]
  );

  async function fetchUpdatedProperty(id: string) {
    window.location.reload();
  }

  async function handleDelete(id: string) {
    const target = listings.find((listing) => listing.id === id);

    if (!target || !window.confirm(`确定删除「${target.name}」吗？这个操作无法撤销。`)) {
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
      setStatus("大楼已删除。");
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
        current.map((item) => (item.id === listing.id ? { ...item, isPublished: result.listing.isPublished } : item))
      );
      if (editingListing?.id === listing.id) {
        setEditingListing(result.listing);
      }
      setStatus(
        result.listing.isPublished ? "上架成功。" : "房源已下架，前台将不再显示。"
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
          onUpdate={() => fetchUpdatedProperty(managingFloorPlansFor.id)}
       />
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">大楼/公寓总数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.total}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">已展示</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.published}</p>
        </div>
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-sm text-slate-500">未展示</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.hidden}</p>
        </div>
      </div>

      {incompleteListings.length ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label text-amber-700">待补全</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950">
                还有 {summary.missingImages} 个房源缺少主图
              </h2>
              <p className="mt-3 text-sm leading-6 text-amber-900/80">
                这些房源已经在数据库里，但还不适合发布。点进编辑页上传主图后，图片链接会自动写回数据库。
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {incompleteListings.map((listing) => (
              <div
                key={`incomplete-${listing.id}`}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-amber-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-slate-950">{listing.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getAreaLabel(listing.area)} · {listing.address}
                  </p>
                  <p className="mt-2 text-sm font-bold text-amber-700">
                    ⚠️ 缺少主图，请点击上传
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
          还没有检测到 `DATABASE_URL`。你可以先看界面，但要真正管理房源，需要先在 Render
          或本地环境中配置 PostgreSQL，并执行 Prisma 迁移。
        </div>
      ) : null}

      <section>
        <div className="max-w-3xl">
          <p className="section-label">{editingListing ? "编辑公寓" : "新增公寓"}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {editingListing ? `正在更新大楼基础信息：${editingListing.name}` : "新建一个公寓大楼"}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            这里的保存会直接入库。新建完大楼后，你可以在下方的名录中点击“管理户型”来添加独立的户型。
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
              setStatus(mode === "create" ? "公寓已创建。请通过下方名录管理户型！" : "公寓更新成功。");
            }}
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">公寓管理</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              已录入的公寓名录
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
                      {getAreaLabel(listing.area)} · {listing.address}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-800">
                      旗下户型: {listing.floorPlans?.length || 0} 个 · {listing.hasBrokerFee ? "有中介费" : "免中介费"} · {listing.acceptsUndergrad ? "接受本科生" : "不接受本科生"}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {listing.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white/70 px-3 py-1">
                        大楼公区图片 {listing.imageUrls.length} 张
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
                      onClick={() => setManagingFloorPlansFor(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      管理户型
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingListing(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <PencilLine className="h-4 w-4" />
                      编辑大楼
                    </button>

                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                    >
                      补主图
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleTogglePublish(listing)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60 hover:bg-slate-50"
                    >
                      <Power className="h-4 w-4" />
                      {listing.isPublished ? "下架" : "上架"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(listing.id)}
                      disabled={pendingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-sm font-medium disabled:opacity-60 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除整个大楼
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-[2rem] p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">还没有房源</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                你可以先在上面的表单里新建一个公寓大楼。保存成功后，下方会列出大楼信息，点击“管理户型”即可录入具体房间。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
