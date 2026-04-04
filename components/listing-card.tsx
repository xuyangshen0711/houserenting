"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ListingViewModel } from "@/lib/listing-view-model";

type ListingCardProps = {
  listing: ListingViewModel;
  index: number;
};

export function ListingCard({ listing, index }: ListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className="md:col-span-full mb-8 relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/55 backdrop-blur-[20px]"
    >
      <div className="flex flex-col md:flex-row">
        {/* Master Image */}
        <div className="relative w-full md:w-2/5 h-64 md:h-auto min-h-[320px]">
          <Image
            src={listing.imageUrls[0] || "/placeholder-house.webp"}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent md:bg-gradient-to-r md:from-slate-950/55 md:via-slate-950/10 md:to-transparent" />

          <div className="absolute bottom-6 right-6 max-w-[85%] text-right text-white">
            <span className="mb-3 inline-block rounded-full border border-white/25 bg-slate-950/45 px-3 py-1 text-xs font-medium backdrop-blur-md shadow-lg">
              {listing.area}
            </span>
            <div className="inline-block rounded-2xl bg-slate-950/48 px-4 py-3 shadow-xl backdrop-blur-md">
              <h3 className="text-3xl font-black tracking-tight leading-none">{listing.title}</h3>
              <p className="mt-2 text-sm font-light text-white/85">{listing.address}</p>
            </div>
            {listing.promotions && (
              <p className="mt-3 inline-block rounded-md bg-emerald-950/65 px-2 py-1 text-sm font-semibold text-emerald-300 shadow-lg">
                🎁 {listing.promotions}
              </p>
            )}
          </div>
        </div>

        {/* Info & Floor Plans */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 mb-1">中介费</p>
              <p className="font-semibold text-slate-800">{listing.hasBrokerFee ? "有中介费" : "无中介费"}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 mb-1">本科生</p>
              <p className="font-semibold text-slate-800">{listing.acceptsUndergrad ? "接受" : "不可"}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 mb-1">宠物政策</p>
              <p className="font-semibold text-slate-800">{listing.petPolicyLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 mb-1">车位</p>
              <p className="font-semibold text-slate-800">{listing.parkingFee ? `$${listing.parkingFee}/月` : "暂无信息"}</p>
            </div>
          </div>

          <div className="mb-4 text-sm font-light text-slate-500 border-l-2 border-violet-200 pl-3">
            🚆 {listing.transitInfo}
          </div>

          <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-4 mt-auto">点击了解更多</h4>
          <div className="space-y-3">
            <Link
              href={`/listings/${listing.slug}`}
              className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm transition duration-200 hover:scale-[1.015] hover:bg-white/75 hover:border-white/60 hover:shadow-float"
            >
              <div className="flex items-center gap-4">
                <span className="border border-slate-200 bg-white text-slate-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
                  Home
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-xs font-light text-slate-500 mt-1">
                    {listing.floorPlans.length
                      ? `${listing.floorPlans.length} 种户型可选`
                      : "房型信息待补充"}
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex items-center md:justify-end gap-2">
                <span className="text-sm font-medium text-slate-500">Starting from</span>
                <span className="text-lg font-black text-slate-900">
                  ${listing.monthlyRent.toLocaleString()}
                </span>
                <span className="text-sm font-light text-slate-400">/ 月</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
