"use client";

import { motion, useReducedMotion, useInView } from "motion/react";
import { useRef } from "react";

/**
 * The unglamorous parts that actually save the money, set as a divided
 * ledger instead of cards: name and explanation on the left, the answer
 * on the right. Hairlines separate the rows; two rows carry a small
 * visual where a number alone would not explain the point. The carbon
 * row carries a muted green, and only because it states a real
 * property of the product.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const CACHE_BARS = [
  { label: "anthropic read", pct: 5, note: "×0.1" },
  { label: "anthropic write", pct: 100, note: "×2.0" },
  { label: "deepseek cache hit", pct: 3, note: "~3% of input" },
  { label: "deepseek full input", pct: 50, note: "×1.0" },
];

function CacheBars() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="mt-4 flex max-w-[420px] flex-col gap-2.5">
      {CACHE_BARS.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="w-36 shrink-0 font-mono text-xs text-faint">{b.label}</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full origin-left rounded-full transition-transform duration-700 ${
                b.pct === 100 ? "bg-burgundy" : "bg-ink/25"
              }`}
              style={{
                width: `${b.pct}%`,
                transform: inView && !reduce ? "scaleX(1)" : "scaleX(0)",
                transitionDelay: `${0.1 + i * 0.07}s`,
              }}
            />
          </div>
          <span className="w-24 shrink-0 text-right font-mono text-xs text-muted">
            {b.note}
          </span>
        </div>
      ))}
    </div>
  );
}

function CarbonMeter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const R = 30;
  const C = 2 * Math.PI * R;

  return (
    <div ref={ref} className="mt-4 flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
          <circle cx="38" cy="38" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
          <motion.circle
            cx="38"
            cy="38"
            r={R}
            fill="none"
            stroke="#3d8b5f"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={reduce ? undefined : { strokeDashoffset: C }}
            animate={inView && !reduce ? { strokeDashoffset: C * (1 - 0.66) } : undefined}
            transition={{ duration: 1.2, ease: EASE }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums text-[#2f6b4a]">
          66%
        </span>
      </div>
      <p className="max-w-[24ch] text-xs leading-relaxed text-faint">
        fewer flagship tokens, same output
      </p>
    </div>
  );
}

type Row = {
  name: string;
  detail: string;
  answer: React.ReactNode;
};

const ROWS: Row[] = [
  {
    name: "Cache-aware pricing",
    detail:
      "Every request is priced the way the provider actually bills it: cache reads, cache writes, full inputs. Our own traffic banked $22.79 in cache savings.",
    answer: <CacheBars />,
  },
  {
    name: "Fair baselines",
    detail:
      "Savings are measured against the same token bundle on a fixed model, at that model’s own cache rates. No flattering math.",
    answer: (
      <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-mist px-4 py-2.5 font-mono text-sm text-muted">
        <span>1,011 requests, actual: $22.41</span>
        <span>deepseek-only: $24.31 · opus-only: $294.68</span>
      </div>
    ),
  },
  {
    name: "Benchmarks",
    detail:
      "Held-out eval across chat, math, mcq, and code, scored blind against a judge and ground truth. Small samples on the non-chat categories.",
    answer: (
      <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-mist px-4 py-2.5 font-mono text-sm text-muted">
        <span>chat 100 · math 80 · mcq 100 · code 50</span>
        <span className="text-faint">87.7% cheaper than all-flagship</span>
      </div>
    ),
  },
  {
    name: "Carbon",
    detail:
      "Spend and carbon fall together. Fewer flagship tokens means fewer GPU-hours.",
    answer: <CarbonMeter />,
  },
  {
    name: "Compaction",
    detail:
      "Long sessions get compacted; past answers get reused, so repeat prompts skip straight to the right tier. 399 calls on our traffic, $0.12 total.",
    answer: (
      <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-mist px-4 py-2.5 font-mono text-sm text-muted">
        <span>summary: 3.4k tokens → 412</span>
        <span className="text-faint">route: remembered → light</span>
      </div>
    ),
  },
  {
    name: "Guardrails",
    detail:
      "Monthly caps that degrade to the light tier. Automatic escalation when a cheap model fails. PII scrubbing on the roadmap.",
    answer: (
      <div className="rounded-xl border border-line bg-mist px-4 py-2.5 font-mono text-sm font-medium text-ink">
        over_cap_policy: degrade_to_light
      </div>
    ),
  },
  {
    name: "Live dashboard",
    detail:
      "Watch every route, token, and cent in real time, on your own machine at localhost:3000.",
    answer: (
      <div className="text-sm font-medium text-muted">tokens, cost, routes</div>
    ),
  },
];

export function Ledger() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <h2 className="max-w-[22ch] text-4xl font-bold leading-[1.1] tracking-tight text-balance text-ink md:text-6xl">
        The boring details, handled.
      </h2>

      <div className="mt-8 border-t border-line">
        {ROWS.map((row) => (
          <div
            key={row.name}
            className="grid gap-3 border-b border-line py-4 md:grid-cols-[1fr_auto] md:items-center md:gap-12 md:py-5"
          >
            <div>
              <h3 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                {row.name}
              </h3>
              <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-muted">
                {row.detail}
              </p>
            </div>
            <div className="md:flex md:min-w-[300px] md:max-w-[420px] md:justify-end">
              {row.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
