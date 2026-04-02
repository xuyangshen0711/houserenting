"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ListingViewModel } from "@/lib/mock-listings";

type ListingCardProps = {
  listing: ListingViewModel;
  index: number;
};

export function ListingCard({ listing, index }: ListingCardProps) {
  const spanClass =
    index % 5 === 0
      ? "md:col-span-4"
      : index % 3 === 0
        ? "md:col-span-3"
        : "md:col-span-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className={spanClass}
    >
      <Link
        href={`/listings/${listing.slug}`}
        className="group glass-panel relative block h-full overflow-hidden rounded-[2rem] p-4 transition duration-300 hover:scale-[1.015] hover:shadow-float sm:p-5"
      >
        <div className="absolute inset-0">
          <Image
            src={listing.imageUrls[0]}
            alt={listing.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/14 to-white/10" />
        </div>

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-900 backdrop-blur-sm">
              {listing.area}
            </span>
            <span className="rounded-full bg-slate-950/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
              {listing.layoutLabel}
            </span>
          </div>

          <div>
            <p className="text-sm text-white/78">{listing.tagline}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{listing.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/80">{listing.address}</p>
            <div className="mt-5 flex items-center justify-between gap-3 text-sm text-white/90">
              <span>{listing.petPolicyLabel}</span>
              <span className="text-lg font-semibold">
                US$ {listing.monthlyRent.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-white/70">/ 月</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
