import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Currency } from "./Currency";
import { IntVal } from "./IntVal";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  /** Color class for value and icon (e.g. "text-success") */
  color?: string;
  /** Background class for icon container */
  iconBg?: string;
  /** Monetary value (shows R$) or plain integer */
  isCurrency?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Hide value */
  hidden?: boolean;
  /** Sub-text below value */
  sub?: string;
  /** Sub-text element (overrides sub string) */
  subElement?: React.ReactNode;
  /** Animation delay */
  delay?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable KPI metric card with animated value.
 * Replaces repeated glass-card + label + AnimatedCounter patterns.
 *
 * Usage:
 *   <KpiCard label="Total Depósitos" value={13207.75} icon={Landmark} color="text-primary" isCurrency />
 *   <KpiCard label="Recargas" value={781} icon={Smartphone} color="text-success" />
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
  iconBg = "bg-primary/10",
  isCurrency = false,
  loading = false,
  hidden = false,
  sub,
  subElement,
  delay = 0,
  className,
  onClick,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 180 }}
      className={cn("kpi-card", className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          {label}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-4 w-4", color)} />
          </div>
        )}
      </div>
      <p className={cn("font-bold", color)} style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>
        {isCurrency ? (
          <Currency
            value={value}
            loading={loading}
            hidden={hidden}
            skeletonWidth="w-20"
            skeletonHeight="h-7"
          />
        ) : (
          <IntVal
            value={value}
            loading={loading}
            skeletonWidth="w-20"
            skeletonHeight="h-7"
          />
        )}
      </p>
      {(sub || subElement) && (
        <div className="flex items-center gap-1 mt-1.5">
          {subElement || (
            <span className="text-[10px] font-medium text-muted-foreground">{sub}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default KpiCard;
