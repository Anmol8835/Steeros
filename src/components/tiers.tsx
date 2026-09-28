"use client";

import { Check } from "@phosphor-icons/react";

/**
 * The three-rung ladder, rendered as plain static stacked cards —
 * no scroll animation, no pinning. Ceilings and prompt shares come
 * from the Steeros repo config and pilot data. Numbers are real;
 * not invented precision.
 */

type Tier = {
  name: string;
  tagline: string;
  ceiling: string;
  ceilingLabel: string;
  handles: string[];
  share: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Light",
    tagline: "The errand tier.",
    ceiling: "$0.003",
    ceilingLabel: "cost ceiling per request",
    handles: ["git messages", "README edits", "typo fixes", "test stubs"],
    share: "51% of a typical mix lands here",
  },
  {
    name: "Balanced",
    tagline: "The daily driver.",
    ceiling: "$0.012",
    ceilingLabel: "cost ceiling per request",
    handles: ["features", "refactors", "code review", "most debugging"],
    share: "32% of a typical mix lands here",
    featured: true,
  },
  {
    name: "Flagship",
    tagline: "When it actually earns it.",
    ceiling: "$0.20",
    ceilingLabel: "cost ceiling per request",
    handles: ["architecture", "hard bugs", "novel design", "long-horizon planning"],
    share: "17% of a typical mix lands here",
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-[0_2px_4px_rgba(34,22,26,0.04),0_24px_48px_-24px_rgba(34,22,26,0.16)] md:p-8 ${
        tier.featured ? "border-burgundy/40" : "border-line"
      }`}
    >
      {/* burgundy top rule on the featured tier only */}
      {tier.featured && (
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-burgundy" />
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {tier.tagline}
          </h3>
          <div className="mt-2.5 text-sm text-muted">{tier.name} tier</div>
          <div className="mt-0.5 text-xs tracking-wide text-faint">{tier.ceilingLabel}</div>
        </div>
        <div
          className={`shrink-0 text-5xl font-bold leading-none tracking-tight tabular-nums md:text-6xl ${
            tier.featured ? "text-burgundy" : "text-ink"
          }`}
        >
          {tier.ceiling}
        </div>
      </div>

      <ul className="mt-6 grid gap-x-10 gap-y-2.5 sm:grid-cols-2 md:mt-8">
        {tier.handles.map((h) => (
          <li key={h} className="flex items-center gap-3 text-base text-muted">
            <Check
              size={14}
              weight="bold"
              className={tier.featured ? "text-burgundy" : "text-line"}
            />
            {h}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-line pt-3 text-sm text-faint">
        {tier.share}
      </p>
    </div>
  );
}

export function Tiers() {
  return (
    <section id="tiers" className="relative">
      <div className="mx-auto max-w-[1200px] px-5 pt-16 md:px-8 md:pt-20">
        <h2 className="max-w-[20ch] text-4xl font-bold leading-[1.1] tracking-tight text-balance text-ink md:text-6xl">
          Three rungs. One ladder.
        </h2>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
          The smallest model that clears the bar wins. You set the
          ceilings; the router spends inside them. One proxy in front of
          DeepSeek, Anthropic, OpenAI, and Gemini.
        </p>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-4 md:px-8 md:py-6">
        {TIERS.map((t) => (
          <div key={t.name} className="mt-4 first:mt-0">
            <div className="w-full">
              <TierCard tier={t} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
