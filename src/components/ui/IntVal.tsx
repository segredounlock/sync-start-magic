import { AnimatedInt } from "@/components/AnimatedCounter";
import { SkeletonValue } from "@/components/Skeleton";

interface IntValProps {
  value: number;
  loading?: boolean;
  duration?: number;
  className?: string;
  skeletonWidth?: string;
  skeletonHeight?: string;
}

/**
 * Animated integer display with rolling counter effect.
 * Replaces all `<AnimatedInt value={x} />` patterns.
 *
 * Usage:
 *   <IntVal value={781} />
 *   <IntVal value={count} loading={isLoading} />
 */
export function IntVal({
  value,
  loading = false,
  duration = 900,
  className = "",
  skeletonWidth = "w-14",
  skeletonHeight = "h-5",
}: IntValProps) {
  if (loading) {
    return <SkeletonValue width={skeletonWidth} className={skeletonHeight} />;
  }

  return <AnimatedInt value={value} duration={duration} className={className} />;
}

export default IntVal;
