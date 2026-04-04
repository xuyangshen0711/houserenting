"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminListingForm } from "@/components/admin-listing-form";
import type { AdminListingRecord } from "@/lib/listing-view-model";

type AdminListingEditorProps = {
  listing: AdminListingRecord;
};

export function AdminListingEditor({ listing }: AdminListingEditorProps) {
  const [currentListing, setCurrentListing] = useState(listing);
  const [status, setStatus] = useState("");

  return (
    <section className="content-wrap pt-10">
      <div className="max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回后台总览
        </Link>

        <div className="mt-8">
          <p className="section-label">房源编辑</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {currentListing.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            这里适合补主图、修正文案和调整展示状态。上传主图后会自动写回数据库，不需要再手动复制链接。
          </p>
          {status ? <p className="mt-4 text-sm text-slate-500">{status}</p> : null}
        </div>

        <div className="mt-8">
          <AdminListingForm
            initialData={currentListing}
            onSuccess={(nextListing) => {
              setCurrentListing(nextListing);
              setStatus(
                nextListing.imageUrls.length
                  ? "房源信息已同步，主图也已经保存到数据库。"
                  : "房源信息已更新。"
              );
            }}
          />
        </div>

      </div>
    </section>
  );
}

