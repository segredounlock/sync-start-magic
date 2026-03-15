import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Map color classes to HSL for drop-shadow glow */
const glowMap: Record<string, string> = {
  "text-primary":            "hsl(152,70%,38%)",
  "text-accent":             "hsl(152,60%,44%)",
  "text-success":            "hsl(152,63%,38%)",
  "text-warning":            "hsl(38,92%,50%)",
  "text-destructive":        "hsl(0,72%,51%)",
  "text-muted-foreground":   "hsl(160,8%,45%)",
  "text-blue-400":           "hsl(217,91%,60%)",
  "text-yellow-400":         "hsl(45,96%,58%)",
  "text-orange-400":         "hsl(27,96%,61%)",
  "text-cyan-400":           "hsl(187,92%,55%)",
  "text-purple-400":         "hsl(270,76%,65%)",
  "text-pink-400":           "hsl(330,80%,60%)",
  "text-red-400":            "hsl(0,84%,60%)",
  "text-emerald-400":        "hsl(160,84%,39%)",
  "text-amber-400":          "hsl(38,92%,50%)",
  "text-sky-400":            "hsl(198,93%,60%)",
  "text-rose-400":           "hsl(350,80%,60%)",
  "text-lime-400":           "hsl(82,78%,55%)",
  "text-teal-400":           "hsl(172,66%,50%)",
  "text-indigo-400":         "hsl(234,89%,74%)",
  "text-[hsl(280,70%,60%)]": "hsl(280,70%,60%)",
  "text-[hsl(200,80%,55%)]": "hsl(200,80%,55%)",
  "text-[hsl(40,80%,55%)]":  "hsl(40,80%,55%)",
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
  const glow = getGlow(color);
  return (
    <motion.div
      whileHover={{ scale: 1.3, rotate: [0, -12, 12, 0] }}
      whileTap={{ scale: 0.85 }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 },
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      style={{
        filter: isActive
          ? `drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 14px ${glow}66)`
          : `drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 12px ${glow}44)`,
      }}
      className="shrink-0"
    >
      <Icon className={cn(size, isActive ? "text-primary-foreground" : color)} />
    </motion.div>
  );
}

/** Grid variant for mobile bottom-sheet menus */
export function FloatingGridIcon({ icon: Icon, color, isActive, index, size = "h-6 w-6" }: FloatingMenuIconProps) {
  const glow = getGlow(color);
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
      whileTap={{ scale: 0.9 }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        y: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 },
        type: "spring",
        stiffness: 350,
        damping: 15,
      }}
      style={{
        filter: `drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 10px ${glow}44)`,
      }}
    >
      <Icon className={cn(size, isActive ? "text-primary" : color)} />
    </motion.div>
  );
}
