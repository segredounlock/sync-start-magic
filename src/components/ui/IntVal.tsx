import { AnimatedInt } from "@/components/AnimatedCounter";
import { SkeletonValue } from "@/components/Skeleton";

interface IntValProps {
  value: number;
  loading?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  skeletonWidth?: string;
  skeletonHeight?: string;
}

export function IntVal({
  value,
  loading = false,
  duration = 900,
  delay = 0,
  className = "",
  skeletonWidth = "w-14",
  skeletonHeight = "h-5",
}: IntValProps) {
  if (loading) {
    return <SkeletonValue width={skeletonWidth} className={skeletonHeight} />;
  }

  return <AnimatedInt value={value} duration={duration} delay={delay} className={className} />;
}

export default IntVal;
