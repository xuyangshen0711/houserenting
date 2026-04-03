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
      className="md:col-span-full mb-8 relative glass-panel overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm"
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
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/60 to-transparent" />
          
          <div className="absolute bottom-6 left-6 text-white">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium mb-3 inline-block">
              {listing.area}
            </span>
            <h3 className="text-3xl font-semibold tracking-tight">{listing.title}</h3>
            <p className="mt-1 text-sm text-white/90">{listing.address}</p>
            {listing.promotions && (
              <p className="mt-3 text-sm font-semibold text-emerald-300 bg-emerald-950/50 inline-block px-2 py-1 rounded-md">
                🎁 {listing.promotions}
              </p>
            )}
          </div>
        </div>

        {/* Info & Floor Plans */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
            <div>
              <p className="text-slate-400 mb-1">中介费</p>
              <p className="font-medium text-slate-800">{listing.hasBrokerFee ? "有中介费" : "无中介费"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">本科生</p>
              <p className="font-medium text-slate-800">{listing.acceptsUndergrad ? "接受" : "不可"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">宠物政策</p>
              <p className="font-medium text-slate-800">{listing.petPolicyLabel}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">车位</p>
              <p className="font-medium text-slate-800">{listing.parkingFee ? `$${listing.parkingFee}/月` : "暂无信息"}</p>
            </div>
          </div>
          
          <div className="mb-4 text-sm text-slate-500 border-l-2 border-slate-200 pl-3">
            🚆 {listing.transitInfo}
          </div>

          <h4 className="text-lg font-semibold text-slate-800 mb-4 mt-auto">可选户型</h4>
          <div className="space-y-3">
            {listing.floorPlans.map((fp) => (
              <Link 
                key={fp.id} 
                href={`/listings/${listing.slug}?layout=${fp.layoutLabel}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 hover:border-slate-300"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm font-semibold shadow-sm group-hover:scale-105 transition-transform">
                    {fp.layoutLabel}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{fp.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {fp.roomSizeSqFt ? `${fp.roomSizeSqFt} sq.ft` : "面积待定"} · {fp.isFurnished ? "包家具" : "无家具"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-0 flex items-center md:justify-end gap-2">
                  <span className="text-lg font-semibold text-slate-900">
                    ${fp.monthlyRent.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">/ 月</span>
                </div>
              </Link>
            ))}
            {listing.floorPlans.length === 0 && (
              <p className="text-sm text-slate-400">当前没有放出的房型。</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
