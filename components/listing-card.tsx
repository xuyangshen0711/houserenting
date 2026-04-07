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

        {/* Info */}
        <Link
          href={`/listings/${listing.slug}`}
          className="w-full md:w-3/5 p-6 md:p-8 flex flex-col group"
        >
          {/* Apartment name — large, prominent */}
          <div className="flex-1 flex items-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl lg:text-4xl">
              {listing.title}
            </h2>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-white/40 bg-white/50 px-4 py-3 transition duration-200 group-hover:bg-white/75">
            <p className="text-sm font-medium text-slate-500">
              <span className="text-slate-400">Location </span>
              {listing.area}
            </p>
            <div className="shrink-0 flex items-baseline gap-1.5">
              {listing.monthlyRent > 0 ? (
                <>
                  <span className="text-sm font-medium text-slate-400">Starting from</span>
                  <span className="text-xl font-black text-slate-950">
                    ${listing.monthlyRent.toLocaleString()}
                  </span>
                  <span className="text-sm font-light text-slate-400">/ 月</span>
                </>
              ) : (
                <span className="text-xl font-black text-slate-950">Ask for price</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
