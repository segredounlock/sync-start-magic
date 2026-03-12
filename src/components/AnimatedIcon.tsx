import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  animation?: "pulse" | "bounce" | "spin" | "wiggle" | "float";
  delay?: number;
}

const animations = {
  pulse: {
    animate: { scale: [1, 1.2, 1] },
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const },
  },
  bounce: {
    animate: { y: [0, -4, 0] },
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
  },
  spin: {
    animate: { rotate: [0, 360] },
    transition: { repeat: Infinity, duration: 3, ease: "linear" as const },
  },
  wiggle: {
    animate: { rotate: [0, -10, 10, -10, 0] },
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const },
  },
  float: {
    animate: { y: [0, -6, 0], x: [0, 2, 0] },
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
  },
};

export function AnimatedIcon({ icon: Icon, className = "", animation = "pulse", delay = 0 }: AnimatedIconProps) {
  const anim = animations[animation];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay }}
      className="inline-flex"
    >
      <motion.div
        animate={anim.animate}
        transition={anim.transition}
      >
        <Icon className={className} />
      </motion.div>
    </motion.div>
  );
}
