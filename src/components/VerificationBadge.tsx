import { motion } from "framer-motion";
import { BadgeCheck, Gem, Flame, Trophy, Star } from "lucide-react";

export type BadgeType = "verificado" | "diamante" | "top" | "elite" | "estrela" | null;

export const BADGE_CONFIG: Record<string, { label: string; icon: typeof BadgeCheck; color: string; fill: string; emoji: string }> = {
  verificado: { label: "Verificado", icon: BadgeCheck, color: "text-success", fill: "fill-success/30", emoji: "✅" },
  diamante: { label: "Diamante", icon: Gem, color: "text-blue-400", fill: "fill-blue-400/30", emoji: "💎" },
  top: { label: "Top", icon: Flame, color: "text-orange-400", fill: "fill-orange-400/30", emoji: "🔥" },
  elite: { label: "Elite", icon: Trophy, color: "text-yellow-400", fill: "fill-yellow-400/30", emoji: "🏆" },
  estrela: { label: "Estrela", icon: Star, color: "text-primary", fill: "fill-primary/30", emoji: "⭐" },
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
  const sizeClass = sizeMap[size];

  // Special animated star with spin-wobble
  if (badge === "estrela") {
    return (
      <svg
        className={`${sizeClass} text-primary flex-shrink-0 animate-[spin-wobble_3s_ease-in-out_infinite]`}
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ animationName: 'spin-wobble' }}
      >
        <path d="M12 2L14.09 8.26L21 9.27L16.18 13.14L17.64 20.02L12 16.77L6.36 20.02L7.82 13.14L3 9.27L9.91 8.26L12 2Z" />
        <path d="M9.5 12.5L11 14L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  const Icon = config.icon;

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
