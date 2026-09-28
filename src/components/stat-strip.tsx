"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Full-bleed burgundy band, the single place where the accent becomes a
 * field. Every number is sourced: the cost cuts come from the Steeros
 * benchmark (benchmark/data/report/report.json) and live usage stats
 * (data/usage-stats.json); the quality claim from the RouteLLM study
 * (LMSYS, arXiv 2406.18665); per-request prices from the local pilot.
 */

const STATS = [
  { value: 87.7, decimals: 1, suffix: "%", label: "cost cut on our held-out eval", source: "139 prompts, router vs all-flagship" },
  { value: 95, decimals: 0, suffix: "%", label: "flagship quality kept", source: "RouteLLM study, LMSYS 2024" },
  { value: 92.4, decimals: 1, suffix: "%", label: "lower than Opus-only routing", source: "our traffic, 1,011 requests" },
  { value: 0.004, decimals: 3, prefix: "$", label: "average light-tier request", source: "vs $0.068 unsteered" },
];

function CountUp({
  value,
  decimals,
  prefix,
}: {
  value: number;
  decimals: number;
  prefix?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });
  const text = useTransform(spring, (v) => prefix + v.toFixed(decimals));

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{text}</motion.span>;
}

function Stat({
  value,
  decimals,
  prefix = "",
  suffix = "",
  label,
  source,
}: {
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className="px-6 py-8 md:px-10">
      <div className="text-4xl font-bold tracking-tight text-white tabular-nums md:text-5xl">
        {inView && !reduce ? (
          <>
            <CountUp value={value} decimals={decimals} prefix={prefix} />
            {suffix}
          </>
        ) : (
          <span>
            {prefix}
            {value.toFixed(decimals)}
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-2 text-base text-white/90">{label}</div>
      <div className="mt-3 text-xs tracking-wide text-white/80">{source}</div>
    </div>
  );
}

export function StatStrip() {
  return (
    <section aria-label="Proof points" className="bg-burgundy">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`border-white/15 ${
              i % 2 === 1 ? "border-l" : ""
            } ${i < 2 ? "border-b lg:border-b-0" : ""} ${
              i > 1 ? "lg:border-l" : ""
            }`}
          >
            <Stat {...s} />
          </div>
        ))}
      </div>
    </section>
  );
}
