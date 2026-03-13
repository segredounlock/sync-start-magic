import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Base shimmer skeleton block */
export function Skeleton({ className, as: Tag = "div" }: SkeletonProps & { as?: "div" | "span" }) {
  return (
    <Tag
      className={cn(
        "rounded-lg bg-muted/60 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-[shimmer_1.8s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

/** Skeleton for a single text line */
export function SkeletonText({ className, width = "w-3/4" }: SkeletonProps & { width?: string }) {
  return <Skeleton className={cn("h-4", width, className)} />;
}

/** Skeleton for a stat card */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("glass-card rounded-xl p-4 space-y-3", className)}>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-7 w-1/2" />
    </div>
  );
}

/** Skeleton for a list row */
export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg", className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0" />
    </div>
  );
}

/** Full page skeleton (replaces PageLoader) */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Content */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <Skeleton className="h-5 w-1/4" />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}

/** Skeleton for pricing cards grid */
export function SkeletonPricingGrid({ count = 6, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-4 space-y-3 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-10" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline skeleton for values like saldo (replaces "...") */
export function SkeletonValue({ className, width = "w-16" }: SkeletonProps & { width?: string }) {
  return <Skeleton className={cn("h-5 inline-block align-middle", width, className)} />;
}

/** Skeleton for sidebar user card */
export function SkeletonUserCard({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}
