"use client";

import { motion } from "framer-motion";

export function Hero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const words = title.split(" ");
  return (
    <div className="relative text-center max-w-3xl mx-auto pt-14 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="eyebrow mb-5"
      >
        {eyebrow}
      </motion.div>
      <h1 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight text-white">
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, delay: 0.12 + i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-block mr-[0.28em]"
          >
            {w}
          </motion.span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 + words.length * 0.04 }}
        className="mt-5 text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
