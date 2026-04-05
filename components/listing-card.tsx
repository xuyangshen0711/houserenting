"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingViewModel } from "@/lib/listing-view-model";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-optimization";

type ListingCardProps = {
  listing: ListingViewModel;
  index: number;
};

export function ListingCard({ listing, index }: ListingCardProps) {
  const imageUrls = listing.imageUrls.length ? listing.imageUrls : ["/placeholder-house.webp"];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [listing.slug]);

  useEffect(() => {
    if (imageUrls.length <= 1 || isCarouselPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageUrls.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [imageUrls.length, isCarouselPaused]);

  function goToPrevImage() {
    setActiveImageIndex((current) => (current - 1 + imageUrls.length) % imageUrls.length);
  }

  function goToNextImage() {
    setActiveImageIndex((current) => (current + 1) % imageUrls.length);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className="md:col-span-full mb-8 relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/55 backdrop-blur-[20px]"
    >
      <div className="flex flex-col md:flex-row">
        {/* Master Image */}
        <div
          className="relative h-56 w-full min-h-[224px] md:h-auto md:w-2/5 md:min-h-[320px]"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <Link
            href={`/listings/${listing.slug}`}
            className="absolute inset-0 block"
          >
            {imageUrls.map((url, imageIndex) => (
              <motion.div
                key={`${listing.slug}-${url}-${imageIndex}`}
                initial={false}
                animate={{ opacity: imageIndex === activeImageIndex ? 1 : 0, scale: imageIndex === activeImageIndex ? 1 : 1.03 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={optimizeCloudinaryUrl(url, "c_fill,w_1200,h_900,f_auto,q_auto")}
                  alt={`${listing.title} 图片 ${imageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </motion.div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/20 via-slate-950/5 to-transparent" />
          </Link>

          {imageUrls.length > 1 ? (
            <>
              <div className="absolute right-4 top-4 rounded-full bg-slate-950/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {activeImageIndex + 1} / {imageUrls.length}
              </div>

              <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between">
                <button
                  type="button"
                  aria-label="上一张图片"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    goToPrevImage();
                  }}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-slate-900 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="下一张图片"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    goToNextImage();
                  }}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-slate-900 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 px-4">
                {imageUrls.map((url, imageIndex) => (
                  <button
                    key={`${url}-dot`}
                    type="button"
                    aria-label={`查看第 ${imageIndex + 1} 张图片`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveImageIndex(imageIndex);
                    }}
                    className={[
                      "h-2.5 rounded-full transition-all",
                      imageIndex === activeImageIndex
                        ? "w-8 bg-white shadow-sm"
                        : "w-2.5 bg-white/55 hover:bg-white/80"
                    ].join(" ")}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Info & Floor Plans */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
          <Link
            href={`/listings/${listing.slug}`}
            className="mb-5 flex items-end justify-between gap-4 rounded-[1.25rem] border border-white/40 bg-white/55 px-4 py-4 backdrop-blur-sm md:hidden"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-950">{listing.title}</p>
              <p className="mt-1 text-sm text-slate-500">{listing.area}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium tracking-[0.08em] text-slate-400">起始价格</p>
              {listing.monthlyRent > 0 ? (
                <p className="mt-1 whitespace-nowrap text-xl font-black text-slate-950">
                  ${listing.monthlyRent.toLocaleString()}
                  <span className="ml-1 text-sm font-medium text-slate-400">/ 月</span>
                </p>
              ) : (
                <p className="mt-1 whitespace-nowrap text-xl font-black text-slate-950">Ask for price</p>
              )}
            </div>
          </Link>

          <div className="hidden text-sm md:mb-8 md:grid md:grid-cols-3 md:gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 mb-1">中介费</p>
              <p className="font-semibold text-slate-800">{listing.hasBrokerFee ? "有中介费" : "无中介费"}</p>
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

          <div className="mb-4 hidden border-l-2 border-violet-200 pl-3 text-sm font-light text-slate-500 md:block">
            🚆 {listing.transitInfo}
          </div>

          <h4 className="mb-4 mt-auto hidden text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 md:block">点击了解更多</h4>
          <div className="space-y-3">
            <Link
              href={`/listings/${listing.slug}`}
              className="group hidden flex-col justify-between rounded-xl border border-white/40 bg-white/50 p-4 transition duration-200 hover:scale-[1.015] hover:border-white/60 hover:bg-white/75 hover:shadow-float md:flex md:flex-row md:items-center"
            >
              <div className="flex items-start gap-4 md:items-center">
                <span className="border border-slate-200 bg-white text-slate-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
                  {listing.area}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-xs font-light text-slate-500 mt-1">
                    {listing.floorPlans.length
                      ? `${listing.floorPlans.length} 种户型可选`
                      : "房型信息待补充"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:justify-end">
                {listing.monthlyRent > 0 ? (
                  <>
                    <span className="text-sm font-medium text-slate-500">Starting from</span>
                    <span className="text-lg font-black text-slate-900">
                      ${listing.monthlyRent.toLocaleString()}
                    </span>
                    <span className="text-sm font-light text-slate-400">/ 月</span>
                  </>
                ) : (
                  <span className="text-lg font-black text-slate-900">Ask for price</span>
                )}
              </div>
            </Link>

            <Link
              href={`/listings/${listing.slug}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 md:hidden"
            >
              查看这套公寓
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
