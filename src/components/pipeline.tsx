"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { Scissors } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * The pipeline as a horizontal pan: classify -> route -> convert -> account.
 * This content really is a sequence, so the cards are numbered.
 * Vertical scroll drives the track sideways while the section is pinned.
 * GSAP only; no Motion components in this tree. Collapses to a vertical
 * stack under prefers-reduced-motion.
 *
 * All panel content is real behavior from the llm_api_server README.
 */

type Panel = {
  n: string;
  step: string;
  title: string;
  copy: string;
  visual: "chips" | "routes" | "sanitize" | "ledger";
};

const PANELS: Panel[] = [
  {
    n: "1",
    step: "Classify",
    title: "Score every request before a single token is spent.",
    copy: "A hybrid classifier reads intent, context, tools, and risk. Rules first, embeddings second, an LLM only when the case is genuinely hard.",
    visual: "chips",
  },
  {
    n: "2",
    step: "Route",
    title: "The cheapest model that clears the bar wins.",
    copy: "Four modes, one policy: cheap, fast, balanced, quality. You set per-tier cost ceilings; the router spends inside them, every time.",
    visual: "routes",
  },
  {
    n: "3",
    step: "Convert",
    title: "Anthropic format in, native format out.",
    copy: "Token caps get clamped, thinking blocks stripped, mid-chat system roles demoted. Each transform is logged so nothing surprises you.",
    visual: "sanitize",
  },
  {
    n: "4",
    step: "Account",
    title: "Every cent accounted, to six decimals.",
    copy: "Provider spend, cache reads and writes, classifier calls, compaction. Measured against a fair baseline, session and all-time.",
    visual: "ledger",
  },
];

const CHIPS = ["docs", "complexity 2/5", "risk low", "dev-tools"];

const ROUTES = [
  { tier: "light", price: "$0.003", chosen: false },
  { tier: "balanced", price: "$0.012", chosen: true },
  { tier: "flagship", price: "$0.20", chosen: false },
];

const SANITIZE = [
  "max_tokens clamped to 8192",
  "thinking block stripped",
  "system message demoted to user",
];

const LEDGER = [
  "req #48211  deepseek-chat  $0.000041",
  "cache read 14.2k tok  ×0.1  $0.00002",
  "baseline: same tokens on a fixed model",
];

function PanelVisual({ visual }: { visual: Panel["visual"] }) {
  if (visual === "chips") {
    return (
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <span
            key={c}
            className="rounded-lg border border-line bg-mist px-3 py-1.5 text-xs font-medium text-muted"
          >
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (visual === "routes") {
    return (
      <div className="flex flex-col gap-2">
        {ROUTES.map((r) => (
          <div
            key={r.tier}
            className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
              r.chosen ? "border-burgundy bg-burgundy-tint" : "border-line bg-mist"
            }`}
          >
            <span className={r.chosen ? "font-semibold text-burgundy" : "text-muted"}>
              {r.tier}
            </span>
            <span className="flex items-center gap-3">
              {r.chosen && <span className="text-xs text-burgundy">chosen</span>}
              <span className={r.chosen ? "font-medium text-ink" : "text-faint"}>
                {r.price}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (visual === "sanitize") {
    return (
      <div className="flex flex-col gap-2">
        {SANITIZE.map((s) => (
          <div
            key={s}
            className="flex items-center gap-3 rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm text-muted"
          >
            <Scissors size={13} weight="bold" className="shrink-0 text-burgundy" />
            {s}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {LEDGER.map((l) => (
        <div
          key={l}
          className="rounded-xl border border-line bg-mist px-3.5 py-2.5 font-mono text-sm text-muted"
        >
          {l}
        </div>
      ))}
    </div>
  );
}

export function Pipeline() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;

    const ctx = gsap.context(() => {
      const distance =
        track.current!.scrollWidth - track.current!.clientWidth;

      // Pan the track's scroll position, not its transform: the track
      // stays put inside the 1200px container and the cards slide
      // within it, ending flush with the container's right padding.
      const tween = gsap.to(track.current, {
        scrollLeft: distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // dim cards as they leave the focus zone
      gsap.utils.toArray<HTMLElement>(".pipeline-panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0.35, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left 95%",
              end: "left 70%",
              scrub: 1.2,
            },
          },
        );
      });
    }, wrap);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="pipeline" ref={wrap} className="relative overflow-hidden">
      <div className="flex h-[100dvh] flex-col justify-center">
        {/* section header lives inside the pinned frame */}
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
          <h2 className="max-w-[20ch] text-4xl font-bold leading-[1.1] tracking-tight text-balance text-ink md:text-6xl">
            Four moves between you and the right model.
          </h2>
        </div>

        <div
          ref={track}
          className={
            reduce
              ? "mx-auto mt-8 flex w-full max-w-[1200px] flex-col gap-4 overflow-visible px-5 md:px-8"
              : "mx-auto mt-8 flex w-full max-w-[1200px] items-stretch gap-4 overflow-hidden px-5 md:mt-10 md:px-8"
          }
        >
          {PANELS.map((p) => (
            <article
              key={p.step}
              className={`pipeline-panel flex shrink-0 flex-col justify-between gap-8 rounded-2xl border border-line bg-white p-6 text-ink shadow-[0_2px_4px_rgba(34,22,26,0.04),0_20px_40px_-20px_rgba(34,22,26,0.14)] md:p-7 ${
                reduce
                  ? "w-full"
                  : "min-h-[min(48dvh,400px)] w-[82vw] md:w-[46vw] lg:w-[34vw] xl:w-[380px]"
              }`}
            >
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-bold leading-none text-burgundy md:text-5xl">
                    {p.n}
                  </span>
                  <span className="text-sm font-medium text-muted">{p.step}</span>
                </div>
                <h3 className="mt-5 max-w-[24ch] text-2xl font-bold leading-tight tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-muted">
                  {p.copy}
                </p>
              </div>
              <PanelVisual visual={p.visual} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
