"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminListingForm } from "@/components/admin-listing-form";

export function AdminListingCreator() {
  const router = useRouter();

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
          <p className="section-label">新增公寓</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            新建一个公寓大楼
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            这里用于创建新的公寓房源。保存后会回到后台首页，你可以继续补图或管理户型。
          </p>
        </div>

        <div className="mt-8">
          <AdminListingForm
            initialData={null}
            onSuccess={() => {
              router.push("/admin?created=1");
              router.refresh();
            }}
          />
        </div>
      </div>
    </section>
  );
}
