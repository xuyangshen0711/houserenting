"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

export function HeroSection() {
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

        {/* Main title */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.18}
          className="mt-10 flex flex-col gap-2 sm:gap-3"
        >
          <h1
            className="text-[2.75rem] font-bold tracking-tight sm:text-[4rem]"
            style={{ color: "#24324A", lineHeight: 1.15 }}
          >
            此心安处
          </h1>
          <p
            className="text-[2.5rem] font-semibold tracking-tight sm:text-[3.5rem]"
            style={{ color: "#3A4A63", lineHeight: 1.15 }}
          >
            归巢栖息
          </p>
        </motion.div>

        {/* Subtitle — stagger ~0.2s after title */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.38}
          className="mt-8 max-w-lg text-sm font-light leading-7 tracking-wide text-slate-600 sm:text-base"
        >
          Aura Boston：波士顿房源精选平台，遇见你的理想居所。
        </motion.p>
      </div>
    </section>
  );
}
