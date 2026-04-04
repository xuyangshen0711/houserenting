"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSchoolDisplayLabel, type RentSortValue } from "@/lib/listing-view-model";

type HomeFiltersProps = {
  areas: string[];
  schools: string[];
  selectedArea: string;
  selectedSchool: string;
  selectedSort: RentSortValue;
  minRent: string;
  maxRent: string;
};

type FilterItem = {
  value: string;
  label: string;
};

// Solid enough to be legible on any colored background
const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(15, 23, 40, 0.08)",
  background: "rgba(255, 255, 255, 0.82)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)"
};

function FilterPills({
  id,
  title,
  items,
  selectedValue,
  getHref,
  displayValue
}: {
  id: string;
  title: string;
  items: FilterItem[];
  selectedValue: string;
  getHref: (value: string) => string;
  displayValue: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[2rem] p-6" style={cardStyle}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight text-slate-950">{title}</h3>
        <p className="text-xs font-light tracking-wide text-slate-500">当前：{displayValue}</p>
      </div>

      <div className="scrollbar-hidden mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {items.map((item) => {
            const isActive = selectedValue === item.value;
            return (
              <Link key={item.value} href={getHref(item.value)} scroll={false}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    "inline-flex rounded-full px-5 py-2.5 text-sm font-medium transition-shadow duration-200",
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-float"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeFilters({
  areas,
  schools,
  selectedArea,
  selectedSchool,
  selectedSort,
  minRent,
  maxRent
}: HomeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minBudget, setMinBudget] = useState(minRent);
  const [maxBudget, setMaxBudget] = useState(maxRent);

  function buildHref(
    nextValues: {
      area?: string;
      school?: string;
      sort?: string;
      minRent?: string;
      maxRent?: string;
    },
    hash?: string
  ) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(nextValues)) {
      if (!value || value === "全部" || value === "default") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    const base = query ? `/?${query}` : "/";
    return hash ? `${base}${hash}` : base;
  }

  function applyBudget() {
    router.push(
      buildHref({ minRent: minBudget.trim(), maxRent: maxBudget.trim() }, "#rent-section"),
      { scroll: false }
    );
  }

  function resetBudget() {
    setMinBudget("");
    setMaxBudget("");
    router.push(
      buildHref({ minRent: "", maxRent: "" }, "#rent-section"),
      { scroll: false }
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <FilterPills
        id="area-section"
        title="地区分类"
        items={areas.map((area) => ({ value: area, label: area }))}
        selectedValue={selectedArea}
        displayValue={selectedArea}
        getHref={(area) => buildHref({ area }, "#area-section")}
      />

      <FilterPills
        id="school-section"
        title="大学分类"
        items={schools.map((school) => ({
          value: school,
          label: school === "全部" ? school : getSchoolDisplayLabel(school)
        }))}
        selectedValue={selectedSchool}
        displayValue={
          selectedSchool === "全部" ? "全部" : getSchoolDisplayLabel(selectedSchool)
        }
        getHref={(school) => buildHref({ school }, "#school-section")}
      />

      <section id="rent-section" className="scroll-mt-28 rounded-[2rem] p-6" style={cardStyle}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold tracking-tight text-slate-950">房租分类</h3>
          <p className="text-xs font-light tracking-wide text-slate-500">
            当前：
            {selectedSort === "rent_asc"
              ? "房租从低到高"
              : selectedSort === "rent_desc"
                ? "房租从高到低"
                : "默认排序"}
          </p>
        </div>

        <div className="scrollbar-hidden mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {[
              { value: "default", label: "默认排序" },
              { value: "rent_asc", label: "房租从低到高" },
              { value: "rent_desc", label: "房租从高到低" }
            ].map((item) => {
              const isActive = selectedSort === item.value;
              return (
                <Link
                  key={item.value}
                  href={buildHref({ sort: item.value }, "#rent-section")}
                  scroll={false}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={[
                      "inline-flex rounded-full px-5 py-2.5 text-sm font-medium transition-shadow duration-200",
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-float"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    ].join(" ")}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <label className="block">
            <span className="mb-2 block text-xs font-medium tracking-wide text-slate-600">最低预算</span>
            <input
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              inputMode="numeric"
              placeholder="例如 2200"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium tracking-wide text-slate-600">最高预算</span>
            <input
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              inputMode="numeric"
              placeholder="例如 3800"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <button
            type="button"
            onClick={applyBudget}
            className="self-end rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-float transition duration-200 hover:scale-105 active:scale-[0.98]"
          >
            应用预算
          </button>

          <button
            type="button"
            onClick={resetBudget}
            className="self-end rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:scale-105 hover:bg-slate-50 active:scale-[0.98]"
          >
            清除预算
          </button>
        </div>
      </section>
    </div>
  );
}
