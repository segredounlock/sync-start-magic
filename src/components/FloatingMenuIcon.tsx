import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Map color classes to rgba for drop-shadow glow */
const glowMap: Record<string, string> = {
  "text-primary":           "hsl(152,70%,38%)",
  "text-accent":            "hsl(152,60%,44%)",
  "text-success":           "hsl(152,63%,38%)",
  "text-warning":           "hsl(38,92%,50%)",
  "text-destructive":       "hsl(0,72%,51%)",
  "text-muted-foreground":  "hsl(160,8%,45%)",
  "text-[hsl(280,70%,60%)]":"hsl(280,70%,60%)",
  "text-[hsl(200,80%,55%)]":"hsl(200,80%,55%)",
  "text-[hsl(40,80%,55%)]": "hsl(40,80%,55%)",
};

function getGlow(color: string) {
  return glowMap[color] || "hsl(152,70%,38%)";
}

interface FloatingMenuIconProps {
  icon: LucideIcon;
  color: string;
  isActive: boolean;
  index: number;
  size?: string;
}

export function FloatingMenuIcon({ icon: Icon, color, isActive, index, size = "h-5 w-5" }: FloatingMenuIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.25, rotate: [0, -10, 10, 0] }}
      whileTap={{ scale: 0.9 }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 },
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      style={
        !isActive
          ? { filter: `drop-shadow(0 0 5px ${getGlow(color)}) drop-shadow(0 0 10px ${getGlow(color)}44)` }
          : {}
      }
      className="shrink-0"
    >
      <Icon className={cn(size, isActive ? "text-primary-foreground" : color)} />
    </motion.div>
  );
}

/** Grid variant for mobile bottom-sheet menus */
export function FloatingGridIcon({ icon: Icon, color, isActive, index, size = "h-6 w-6" }: FloatingMenuIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      animate={{ y: [0, -2, 0] }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 },
      }}
      style={
        !isActive
          ? { filter: `drop-shadow(0 0 4px ${getGlow(color)})` }
          : {}
      }
    >
      <Icon className={cn(size, isActive ? "text-primary" : color)} />
    </motion.div>
  );
}
