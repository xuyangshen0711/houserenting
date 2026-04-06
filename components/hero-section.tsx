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

        {/* Main title — solid indigo-950 for max contrast on mobile */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.18}
          className="mt-7 text-6xl font-black tracking-tighter text-indigo-950 sm:text-8xl leading-[1.2]"
        >
          此心安处
          <br />
          归巢栖息
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
    </section>
  );
}
