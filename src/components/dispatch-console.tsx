"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

/**
 * The live dispatch console. A real animated component (not a
 * screenshot): a demo feed cycles prompts through classify -> route ->
 * cost, exactly like the Steeros proxy does. Data mirrors the dispatch
 * log in the Steeros repo; numbers are pilot-demo values and labeled as
 * such.
 *
 * Pauses itself when off-screen or when the tab is hidden. Honors
 * prefers-reduced-motion by rendering one static frame.
 */

type Entry = {
  prompt: string;
  task: string;
  complexity: string;
  risk: string;
  tier: "light" | "balanced" | "top";
  provider: string;
  before: number;
  after: number;
  saved: number;
};

const FEED: Entry[] = [
  { prompt: "fix typo in README", task: "docs", complexity: "1/5", risk: "low", tier: "light", provider: "deepseek", before: 0.068, after: 0.004, saved: 0.041 },
  { prompt: "write git commit message", task: "docs", complexity: "1/5", risk: "low", tier: "light", provider: "deepseek", before: 0.068, after: 0.004, saved: 0.044 },
  { prompt: "add unit tests for parser", task: "tests", complexity: "2/5", risk: "low", tier: "light", provider: "deepseek", before: 0.068, after: 0.004, saved: 0.038 },
  { prompt: "refactor auth module to async", task: "refactor", complexity: "3/5", risk: "medium", tier: "balanced", provider: "openai", before: 0.068, after: 0.02, saved: 0.063 },
  { prompt: "debug prod crash on startup", task: "debug", complexity: "4/5", risk: "high", tier: "balanced", provider: "openai", before: 0.068, after: 0.02, saved: 0.057 },
  { prompt: "design new migration strategy", task: "design", complexity: "5/5", risk: "high", tier: "top", provider: "anthropic", before: 0.068, after: 0.068, saved: 0.0 },
];

const TIERS = [
  { key: "light", label: "light", price: "$0.003" },
  { key: "balanced", label: "balanced", price: "$0.012" },
  { key: "top", label: "flagship", price: "$0.20" },
] as const;

const TYPE_MS = 26;
const CLASSIFY_MS = 800;
const ROUTE_MS = 620;
const DONE_MS = 1500;

type Phase = "typing" | "classifying" | "routing" | "done";

export function DispatchConsole() {
  const reduce = useReducedMotion();

  // cursor spotlight on the card
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, rgba(138,34,51,0.05), transparent 70%)`;

  const [entryIdx, setEntryIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState(0);
  const [savedTotal, setSavedTotal] = useState(0);
  const [visible, setVisible] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const typedRef = useRef(0);

  const entry = FEED[entryIdx % FEED.length];

  // pause when off-screen or tab hidden
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // main loop: type -> classify -> route -> done -> next entry.
  // Typing progress lives in a ref so state updaters stay side-effect free.
  useEffect(() => {
    if (reduce || !visible || tabHidden) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(setTimeout(fn, ms));

    typedRef.current = 0;
    setTyped(0);
    setPhase("typing");
    const total = entry.prompt.length;

    const tick = () => {
      typedRef.current += 1;
      setTyped(typedRef.current);
      if (typedRef.current >= total) {
        later(() => setPhase("classifying"), 120);
        later(() => setPhase("routing"), 120 + CLASSIFY_MS);
        later(() => {
          setPhase("done");
          setSavedTotal((s) => s + entry.saved);
        }, 120 + CLASSIFY_MS + ROUTE_MS);
        later(
          () => setEntryIdx((i) => i + 1),
          120 + CLASSIFY_MS + ROUTE_MS + DONE_MS,
        );
        return;
      }
      later(tick, TYPE_MS);
    };
    later(tick, 350);

    return () => timers.forEach(clearTimeout);
  }, [entryIdx, entry, reduce, visible, tabHidden]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  if (reduce) {
    const staticEntry = FEED[3];
    return (
      <Card>
        <Header />
        <PromptLine text={staticEntry.prompt} typed={staticEntry.prompt.length} />
        <Meters entry={staticEntry} on />
        <RouteRow entry={staticEntry} active />
        <CostRow entry={staticEntry} done />
        <Footer saved={1.204} />
      </Card>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={onMove}
      role="img"
      aria-label="Animated demo of the Steeros dispatch console: a prompt is classified, routed to a tier, and costed"
    >
      <Card>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
          style={{ background: glow }}
        />
        <Header />
        <PromptLine text={entry.prompt} typed={typed} caret={phase === "typing"} />
        <Meters entry={entry} on={phase === "classifying" || phase === "routing" || phase === "done"} />
        <RouteRow entry={entry} active={phase === "routing" || phase === "done"} />
        <CostRow entry={entry} done={phase === "done"} />
        <Footer saved={savedTotal} />
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-[0_2px_4px_rgba(34,22,26,0.04),0_24px_48px_-24px_rgba(34,22,26,0.18)] md:p-7">
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between text-xs tracking-wide text-faint">
      <span className="font-medium text-ink">steeros dispatch</span>
      <span className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-burgundy animate-live" />
          live
        </span>
        <span className="hidden sm:inline">127.0.0.1:8002</span>
        <span>demo feed</span>
      </span>
    </div>
  );
}

function PromptLine({ text, typed, caret }: { text: string; typed: number; caret?: boolean }) {
  return (
    <div className="min-h-7 font-mono text-base leading-relaxed text-ink">
      <span className="text-burgundy">▸</span>{" "}
      {text.slice(0, typed)}
      {caret && (
        <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[0.18em] rounded-full bg-burgundy animate-caret" />
      )}
    </div>
  );
}

function Meters({ entry, on }: { entry: Entry; on: boolean }) {
  const rows = [
    { label: "task", value: entry.task },
    { label: "complexity", value: entry.complexity },
    { label: "risk", value: entry.risk },
  ];
  const fill = (v: string) => {
    const n = Number(v.split("/")[0]);
    return Math.max(n, 1) / 5;
  };
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl border border-line bg-mist px-3 py-2.5">
          <div className="text-xs font-medium tracking-wide text-faint">{r.label}</div>
          <div className={`mt-1 text-xs font-medium text-ink transition-opacity duration-500 ${on ? "opacity-100" : "opacity-30"}`}>
            {on ? r.value : "…"}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full origin-left rounded-full bg-burgundy transition-transform duration-700 ease-out"
              style={{
                transform: on ? `scaleX(${fill(r.value)})` : "scaleX(0)",
                transitionDelay: on ? "180ms" : "0ms",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RouteRow({ entry, active }: { entry: Entry; active: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-medium">
        {TIERS.map((t) => {
          const is = t.key === entry.tier;
          return (
            <span
              key={t.key}
              className={`rounded-full border px-2.5 py-1 transition-colors duration-500 ${
                active && is
                  ? "border-burgundy bg-burgundy text-white"
                  : "border-line text-faint"
              }`}
            >
              {t.label}
            </span>
          );
        })}
      </div>
      <div className={`text-xs text-muted transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
        via {entry.provider}
      </div>
    </div>
  );
}

function CostRow({ entry, done }: { entry: Entry; done: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line bg-mist px-3.5 py-2.5 font-mono text-xs">
      <span className={`transition-opacity duration-500 ${done ? "opacity-100" : "opacity-30"}`}>
        <span className="text-faint line-through">${entry.before.toFixed(3)}</span>
        <span className="text-faint"> → </span>
        <span className="font-medium text-ink">${entry.after.toFixed(3)}</span>
      </span>
      <span className={`transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
        saved{" "}
        <span className={entry.saved > 0 ? "font-medium text-burgundy" : "text-faint"}>
          {entry.saved > 0 ? `$${entry.saved.toFixed(3)}` : "$0.000"}
        </span>
      </span>
    </div>
  );
}

function Footer({ saved }: { saved: number }) {
  return (
    <div className="flex items-center justify-between border-t border-dashed border-line pt-3.5 text-xs text-faint">
      <span>session saved</span>
      <motion.span
        key={saved.toFixed(2)}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm font-semibold tabular-nums text-burgundy"
      >
        ${saved.toFixed(2)}
      </motion.span>
    </div>
  );
}
