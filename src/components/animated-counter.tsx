"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, type SpringOptions } from "motion/react";

const SPRING_CONFIG: SpringOptions = {
  stiffness: 80,
  damping: 20,
  mass: 1,
};

const INITIAL_DELAY = 400;

interface AnimatedCounterProps {
  value: number;
  className?: string;
  formatter?: (n: number) => string;
}

export function AnimatedCounter({
  value,
  className,
  formatter = (n) =>
    n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, SPRING_CONFIG);
  const [display, setDisplay] = useState("0.00");
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      const timer = setTimeout(() => motionValue.set(value), INITIAL_DELAY);
      return () => clearTimeout(timer);
    }
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(formatter(latest));
    });
    return unsubscribe;
  }, [spring, formatter]);

  return <span className={className}>{display}</span>;
}
