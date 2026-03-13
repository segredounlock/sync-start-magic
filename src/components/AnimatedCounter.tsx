import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 900,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>();
  const mountedRef = useRef(false);

  useEffect(() => {
    const from = mountedRef.current ? prevValue.current : 0;
    mountedRef.current = true;
    const to = value;
    prevValue.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for smooth deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

interface AnimatedIntProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedInt({ value, duration = 900, className = "" }: AnimatedIntProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>();
  const mountedRef = useRef(false);

  useEffect(() => {
    const from = mountedRef.current ? prevValue.current : 0;
    mountedRef.current = true;
    const to = value;
    prevValue.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString("pt-BR")}</span>;
}
