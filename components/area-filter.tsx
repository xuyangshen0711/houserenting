"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type AreaFilterProps = {
  areas: string[];
  selectedArea: string;
};

export function AreaFilter({ areas, selectedArea }: AreaFilterProps) {
  return (
    <div className="scrollbar-hidden mt-6 overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {areas.map((area) => {
          const isActive = selectedArea === area;

          return (
            <Link
              key={area}
              href={area === "全部" ? "/" : `/?area=${encodeURIComponent(area)}`}
              scroll={false}
            >
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={[
                  "inline-flex rounded-full px-5 py-3 text-sm transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-float"
                    : "glass-panel text-slate-700"
                ].join(" ")}
              >
                {area}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
