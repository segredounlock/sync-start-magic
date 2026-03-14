import { AnimatedCounter } from "@/components/AnimatedCounter";
import { SkeletonValue } from "@/components/Skeleton";

interface CurrencyProps {
  value: number;
  sign?: boolean;
  loading?: boolean;
  hidden?: boolean;
  duration?: number;
  delay?: number;
  decimals?: number;
  className?: string;
  skeletonWidth?: string;
  skeletonHeight?: string;
}

export function Currency({
  value,
  sign = false,
  loading = false,
  hidden = false,
  duration = 900,
  delay = 0,
  decimals = 2,
  className = "",
  skeletonWidth = "w-20",
  skeletonHeight = "h-5",
}: CurrencyProps) {
  if (loading) {
    return <SkeletonValue width={skeletonWidth} className={skeletonHeight} />;
  }

  if (hidden) {
    return <span className={className}>R$&nbsp;••••</span>;
  }

  return (
    <span className={className}>
      {sign && (value >= 0 ? "+" : "")}
      <AnimatedCounter value={sign ? Math.abs(value) : value} prefix="R$&nbsp;" decimals={decimals} duration={duration} delay={delay} />
    </span>
  );
}

export default Currency;
