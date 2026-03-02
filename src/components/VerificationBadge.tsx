import { motion } from "framer-motion";
import { BadgeCheck, Gem, Flame, Trophy } from "lucide-react";

export type BadgeType = "verificado" | "diamante" | "top" | "elite" | null;

export const BADGE_CONFIG: Record<string, { label: string; icon: typeof BadgeCheck; color: string; fill: string; emoji: string }> = {
  verificado: { label: "Verificado", icon: BadgeCheck, color: "text-success", fill: "fill-success/30", emoji: "✅" },
  diamante: { label: "Diamante", icon: Gem, color: "text-blue-400", fill: "fill-blue-400/30", emoji: "💎" },
  top: { label: "Top", icon: Flame, color: "text-orange-400", fill: "fill-orange-400/30", emoji: "🔥" },
  elite: { label: "Elite", icon: Trophy, color: "text-yellow-400", fill: "fill-yellow-400/30", emoji: "🏆" },
};

interface VerificationBadgeProps {
  badge: BadgeType;
  size?: "xs" | "sm" | "md";
  animate?: boolean;
}

const sizeMap = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4" };

export function VerificationBadge({ badge, size = "sm", animate = true }: VerificationBadgeProps) {
  if (!badge || !BADGE_CONFIG[badge]) return null;

  const config = BADGE_CONFIG[badge];
  const Icon = config.icon;
  const sizeClass = sizeMap[size];

  if (!animate) {
    return <Icon className={`${sizeClass} ${config.color} ${config.fill} flex-shrink-0`} />;
  }

  return (
    <motion.div
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      className="inline-flex flex-shrink-0"
    >
      <Icon className={`${sizeClass} ${config.color} ${config.fill}`} />
    </motion.div>
  );
}
