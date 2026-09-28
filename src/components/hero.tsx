"use client";

import { motion, useReducedMotion } from "motion/react";
import { Magnetic } from "@/components/ui/magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero. One orchestrated load sequence, nothing else animates on this
 * section. Space Grotesk carries the headline. White field, one
 * burgundy accent.
 */
export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden">
      {/* one soft burgundy wash, kept faint on white */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 right-[-14%] h-[640px] w-[640px] rounded-full bg-burgundy/[0.05] blur-[120px]"
      />

      <div className="relative mx-auto flex max-w-[1200px] items-start px-5 pb-10 pt-20 md:px-8 md:pt-24">
        {/* copy */}
        <div>
          <h1 className="text-hero font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-hero-lg">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
              >
                Every prompt pays
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, delay: 0.22, ease: EASE }}
              >
                the right price.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mt-7 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg"
          >
            Steeros routes every prompt to the cheapest model that can
            handle it. Up to 85% lower spend, same quality. One proxy,
            no code changes.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic strength={0.2}>
              <a
                href="#pricing"
                className="flex h-12 items-center rounded-full bg-burgundy px-7 text-base font-medium text-white transition-all duration-200 hover:shadow-[0_10px_24px_-10px_rgba(138,34,51,0.65)] active:translate-y-px"
              >
                Start saving
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href="#pipeline"
                className="flex h-12 items-center rounded-full border border-line bg-white px-7 text-base font-medium text-ink transition-colors duration-200 hover:border-burgundy hover:text-burgundy active:translate-y-px"
              >
                See it route
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
