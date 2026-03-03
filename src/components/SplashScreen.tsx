import { motion } from "framer-motion";
import logo from "@/assets/recargas-brasil-logo.jpeg";

// Preload globally so it's cached
const _preload = new Image();
_preload.src = logo;

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--background))]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10"
      >
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20">
          <img
            src={logo}
            alt="Recargas Brasil"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex gap-2 mt-6 z-10"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.45, 0, 0.55, 1],
            }}
          />
        ))}
      </motion.div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-4 text-sm text-muted-foreground font-medium tracking-wide z-10"
      >
        Carregando...
      </motion.p>
    </div>
  );
}
