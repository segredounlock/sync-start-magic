import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface PopupBannerProps {
  title?: string;
  subtitle?: string;
  visible?: boolean;
  link?: string;
  onClose?: () => void;
}

export function PopupBanner({
  title = "🎉 Novidade!",
  subtitle = "Confira as novidades da plataforma!",
  visible = true,
  link,
  onClose,
}: PopupBannerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
    setOpen(false);
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleClick = () => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  const floatingEmojis = ["🎉", "🔥", "⭐", "💎", "🚀"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-primary/20 bg-card shadow-2xl overflow-hidden pointer-events-auto">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

              {/* Floating emojis */}
              {floatingEmojis.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl select-none pointer-events-none opacity-15"
                  style={{
                    top: `${10 + (i * 20) % 70}%`,
                    left: `${5 + (i * 25) % 85}%`,
                  }}
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, i % 2 === 0 ? 15 : -15, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="relative px-6 py-8 text-center space-y-4">
                {/* Animated icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto"
                >
                  <span className="text-3xl">📢</span>
                </motion.div>

                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>

                {link && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClick}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Acessar agora
                  </motion.button>
                )}
              </div>

              {/* Bottom accent bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
