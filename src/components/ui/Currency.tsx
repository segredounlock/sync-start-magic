import { AnimatedCounter } from "@/components/AnimatedCounter";
import { SkeletonValue } from "@/components/Skeleton";

interface CurrencyProps {
  value: number;
  /** Show +/- sign before value */
  sign?: boolean;
  /** Loading state — shows skeleton */
  loading?: boolean;
  /** Hide value (show ••••) */
  hidden?: boolean;
  /** Animation duration in ms (default 900) */
  duration?: number;
  /** Number of decimal places (default 2) */
  decimals?: number;
  className?: string;
  /** Skeleton width class (default w-20) */
  skeletonWidth?: string;
  /** Skeleton height class */
  skeletonHeight?: string;
}

/**
 * Animated currency display with rolling counter effect.
 * Replaces all `fmt(value)` and `<AnimatedCounter prefix="R$" />` patterns.
 *
 * Usage:
 *   <Currency value={1500} />
 *   <Currency value={lucro} sign />
 *   <Currency value={saldo} loading={isLoading} hidden={!showBalance} />
 */
export function Currency({
  value,
  sign = false,
  loading = false,
  hidden = false,
  duration = 900,
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
      <AnimatedCounter value={sign ? Math.abs(value) : value} prefix="R$&nbsp;" decimals={decimals} duration={duration} />
    </span>
  );
}

export default Currency;
