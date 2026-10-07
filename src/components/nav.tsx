"use client";

import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { HoneycombLogo } from "@/components/ui/honeycomb-logo";
import { NavAuth } from "@/components/nav-auth";

const LINKS: { label: string; href: string; highlight?: boolean }[] = [
  { label: "How it routes", href: "#pipeline" },
  { label: "Tiers", href: "#tiers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Early access", href: "/early-access", highlight: true },
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
        <nav className="flex h-16 items-center justify-between px-5 md:px-8">
          <a
            href="#top"
            aria-label="Steeros home"
            className="flex items-center text-ink"
          >
            <HoneycombLogo className="h-[26px] w-auto shrink-0" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  l.highlight
                    ? "rounded-full bg-burgundy-tint px-4 py-1.5 text-base font-medium text-burgundy transition-colors duration-200 hover:bg-burgundy/15"
                    : "text-base font-medium text-muted transition-colors duration-200 hover:text-ink"
                }
              >
                {l.label}
              </Link>
            ))}
            <NavAuth />
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
