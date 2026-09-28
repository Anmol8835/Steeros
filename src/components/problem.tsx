"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * The problem as a single statement. Words brighten as you scroll
 * through; nothing else on this section moves. Copy sourced from the
 * Steeros repo. GSAP only; no Motion components in this tree.
 */

const LINE = "Like taking a Ferrari to buy milk. Every single time.";

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".prob-word",
        { opacity: 0.14, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "top 30%",
            scrub: 1.2,
          },
        },
      );
      gsap.fromTo(
        ".prob-intro",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            end: "top 55%",
            scrub: 1.2,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  const words = LINE.split(" ");

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28"
    >
      <p
        className="prob-intro max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        style={{ opacity: reduce ? 1 : 0 }}
      >
        Pick a flagship and the door flies open for everything. Teams burn
        60-70% of their spend on prompts a small model handles perfectly.
      </p>

      <p className="mt-10 max-w-[24ch] text-4xl font-bold leading-[1.18] tracking-tight text-ink sm:text-6xl lg:text-7xl">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span
              className="prob-word inline-block"
              style={{ opacity: reduce ? 1 : 0.14 }}
            >
              {w}
            </span>
            {/* the space must sit between the inline-blocks: trailing
                whitespace inside an inline-block collapses */}
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
