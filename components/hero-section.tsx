"use client";

import { motion } from "framer-motion";
import { getSchoolDisplayLabel } from "@/lib/listing-view-model";

type HeroSectionProps = {
  selectedArea: string;
  selectedSchool: string;
  rentSummary: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

// Bento card glass style — bg-white/60 + fine border for mobile pop
const bentoStyle: React.CSSProperties = {
  border: "0.5px solid rgba(255,255,255,0.50)",
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)"
};

export function HeroSection({ selectedArea, selectedSchool, rentSummary }: HeroSectionProps) {
  return (
    <section className="content-wrap relative pt-16 sm:pt-24">
      <div className="max-w-4xl">
        {/* Label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.05}
        >
          <span className="section-label">Aura Boston · 精选住居</span>
        </motion.div>

        {/* Main title — solid indigo-950 for max contrast on mobile */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.18}
          className="mt-7 text-5xl font-black tracking-tighter text-indigo-950 sm:text-7xl leading-[1.08]"
        >
          此心安处，归巢栖息
        </motion.h1>

        {/* Subtitle — stagger ~0.2s after title */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.38}
          className="mt-5 max-w-lg text-sm font-light leading-7 tracking-wide text-slate-800 sm:text-base"
        >
          Aura Boston：波士顿房源精选平台，遇见你的理想居所。
        </motion.p>
      </div>

      {/* Bento cards — staggered group */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.62 } }
        }}
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-6"
      >
        {/* Area — wide card */}
        <motion.a
          href="#area-section"
          variants={fadeUp}
          custom={0}
          style={bentoStyle}
          className="col-span-2 sm:col-span-4 block rounded-[2rem] p-6 transition duration-300 hover:scale-[1.015] hover:shadow-float active:scale-[0.99]"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">地区分类</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {selectedArea === "全部" ? "Back Bay · Malden · Everett" : selectedArea}
          </p>
          <p className="mt-2 text-sm font-light text-slate-500">选择你想要的城市区域</p>
        </motion.a>

        {/* School — narrow card */}
        <motion.a
          href="#school-section"
          variants={fadeUp}
          custom={0}
          style={bentoStyle}
          className="col-span-2 sm:col-span-2 block rounded-[2rem] p-6 transition duration-300 hover:scale-[1.015] hover:shadow-float active:scale-[0.99]"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">大学分类</p>
          <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            {selectedSchool === "全部"
              ? "BU · NEU · Harvard"
              : `${getSchoolDisplayLabel(selectedSchool)} 附近`}
          </p>
        </motion.a>

        {/* Rent — full-width bar */}
        <motion.a
          href="#rent-section"
          variants={fadeUp}
          custom={0}
          style={bentoStyle}
          className="col-span-2 sm:col-span-6 flex items-center justify-between rounded-[2rem] px-6 py-5 transition duration-300 hover:scale-[1.006] hover:shadow-float active:scale-[0.99]"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">房租排序</p>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-slate-950">
              {rentSummary === "默认" ? "可自选升序或降序排列" : `当前按房租${rentSummary}排列`}
            </p>
          </div>
          <span className="text-5xl font-black text-slate-200 select-none">$</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
