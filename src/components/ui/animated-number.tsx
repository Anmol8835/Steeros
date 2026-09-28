"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

/**
 * Number that springs toward its target value. Runs entirely on motion
 * values, so changing `value` never re-renders per animation frame.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 26, mass: 0.9 });
  const text = useTransform(spring, (v) => format(v));

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
