"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, TrainFront } from "lucide-react";
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
  const hasRent = listing.monthlyRent > 0;

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

        <Link
          href={`/listings/${listing.slug}`}
          className="group flex w-full flex-1 flex-col justify-between p-6 transition duration-200 hover:bg-white/18 md:w-3/5 md:p-7 lg:p-8"
        >
          <div>
            <h3 className="listing-card-title text-[2.25rem] leading-none text-slate-950 sm:text-[2.6rem] lg:text-[3.3rem]">
              {listing.title}
            </h3>

            <div className="mt-4 rounded-[1.4rem] border border-white/55 bg-white/62 px-4 py-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)] backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950/6 text-slate-700">
                  <TrainFront className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7 text-slate-600 md:text-[0.95rem]">
                  {listing.transitInfo}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium tracking-[0.02em] text-slate-500">
              点击了解更多
            </p>
          </div>

          <div className="mt-6 rounded-[1.55rem] border border-white/65 bg-white/78 px-5 py-4 shadow-[0_20px_45px_rgba(148,163,184,0.15)] backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[0.92rem] text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="whitespace-nowrap">Location :</span>
                  <span className="truncate text-lg font-semibold text-slate-950">
                    {listing.area}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                <span className="hidden h-2.5 w-2.5 rounded-full bg-rose-400 sm:inline-flex" />
                {hasRent ? (
                  <p className="text-sm text-slate-500">
                    <span>Starting from</span>
                    <span className="ml-3 text-[1.65rem] font-black tracking-[-0.03em] text-slate-950">
                      ${listing.monthlyRent.toLocaleString()}
                    </span>
                    <span className="ml-1 text-base font-medium text-slate-400">/ 月</span>
                  </p>
                ) : (
                  <p className="text-lg font-bold text-slate-950">Ask for price</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
