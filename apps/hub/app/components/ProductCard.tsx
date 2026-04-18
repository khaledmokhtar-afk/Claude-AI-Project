"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  audience: string[];
  modules: string[];
  accentHex: string;
  accentSoftHex: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function ProductCard({
  product,
  href,
  delay,
}: {
  product: Product;
  href: string;
  delay: number;
}) {
  const Icon = product.icon;
  const MotionLink = motion(Link);
  return (
    <MotionLink
      href={href}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="card-tilt glass relative overflow-hidden p-7 group block"
      style={{
        boxShadow: `0 0 0 1px color-mix(in srgb, ${product.accentHex} 25%, transparent), 0 30px 60px -30px color-mix(in srgb, ${product.accentHex} 55%, transparent)`,
      }}
    >
      {/* Color wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at top left, ${product.accentHex}30 0%, transparent 60%)`,
        }}
      />

      {/* Grid lines overlay */}
      <div className="absolute inset-0 grid-lines opacity-50 pointer-events-none" />

      <div className="relative">
        {/* Icon + tag */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `${product.accentHex}18`,
              border: `1px solid ${product.accentHex}40`,
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: product.accentSoftHex }}
            />
          </div>
          <div
            className="text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded-md"
            style={{
              background: `${product.accentHex}15`,
              color: product.accentSoftHex,
              border: `1px solid ${product.accentHex}30`,
            }}
          >
            Live
          </div>
        </div>

        {/* Name + tagline */}
        <h3
          className="text-3xl font-semibold tracking-tight mb-1"
          style={{ color: product.accentSoftHex }}
        >
          {product.name}
        </h3>
        <p className="text-sm text-[var(--color-text)] mb-4 font-medium">
          {product.tagline}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed min-h-[4.5rem]">
          {product.description}
        </p>

        {/* Audience tags */}
        <div className="flex flex-wrap gap-1.5 mt-5">
          {product.audience.map((a) => (
            <span
              key={a}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-white/10 text-[var(--color-text-muted)]"
            >
              {a}
            </span>
          ))}
        </div>

        {/* Module coverage */}
        <div className="mt-5 pt-5 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Covers
          </div>
          <div className="flex flex-col gap-1">
            {product.modules.map((m) => (
              <div key={m} className="text-xs flex items-center gap-2">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: product.accentSoftHex }}
                />
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Launch button */}
        <div className="mt-6 flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-transform group-hover:translate-x-1"
            style={{
              background: product.accentHex,
              color: "#0B1120",
            }}
          >
            Launch {product.name}
            <span className="text-base">→</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] group-hover:text-white transition-colors">
            Opens in this window
          </span>
        </div>
      </div>
    </MotionLink>
  );
}
