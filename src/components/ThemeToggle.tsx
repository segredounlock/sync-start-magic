import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full glass-input transition-all duration-300 group overflow-hidden"
      aria-label="Alternar tema"
    >
      {/* Background glow animation */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: theme === "dark"
            ? "linear-gradient(135deg, hsl(220 25% 10%), hsl(250 25% 15%))"
            : "linear-gradient(135deg, hsl(45 100% 90%), hsl(200 80% 90%))",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      
      {/* Toggle knob */}
      <motion.span
        className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center bg-primary"
        animate={{
          left: theme === "dark" ? "calc(100% - 1.625rem)" : "0.125rem",
          boxShadow: theme === "dark"
            ? "0 0 12px hsl(145 70% 50% / 0.5)"
            : "0 0 8px hsl(145 70% 40% / 0.3)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
            >
              <Moon className="h-3.5 w-3.5 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
            >
              <Sun className="h-3.5 w-3.5 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
