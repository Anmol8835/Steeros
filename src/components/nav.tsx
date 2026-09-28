"use client";

import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { HoneycombLogo } from "@/components/ui/honeycomb-logo";

const LINKS = [
  { label: "How it routes", href: "#pipeline" },
  { label: "Tiers", href: "#tiers" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <div
        className={`transition-colors duration-300 ${
          scrolled
            ? "border-b border-line bg-white/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-2xl font-bold tracking-wider text-ink"
          >
            <HoneycombLogo className="h-[26px] w-auto shrink-0" />
            STEEROS
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-base font-medium text-muted transition-colors duration-200 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href="#pricing"
            className="flex h-10 items-center rounded-full bg-burgundy px-5 text-sm font-medium text-white transition-all duration-200 hover:shadow-[0_8px_20px_-8px_rgba(138,34,51,0.6)] active:translate-y-px"
          >
            Start saving
          </a>
        </nav>
      </div>
    </header>
  );
}
