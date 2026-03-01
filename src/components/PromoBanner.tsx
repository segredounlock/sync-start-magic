import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { useState } from "react";

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  visible?: boolean;
  link?: string;
  onClose?: () => void;
}

export function PromoBanner({ 
  title = "🤖 Nosso Bot do Telegram está online! Acesse agora 🚀",
  subtitle = "📱 Consulte saldo, faça recargas e receba notificações direto no Telegram! ⚡💬",
  visible = true,
  link,
  onClose
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  const handleBannerClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full mb-4">
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-lg backdrop-blur-sm bg-background/95 cursor-pointer"
            onClick={handleBannerClick}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 animate-gradient-x" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
            
            {/* Floating Telegram-themed particles */}
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-3 right-20 opacity-30"
            >
              <Send className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-3 left-8 opacity-20"
            >
              <MessageCircle className="h-4 w-4 text-accent" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-4 left-[30%] opacity-20"
            >
              <Bot className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Content */}
            <div className="relative px-5 py-4 flex items-center gap-4">
              {/* Telegram Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"
              >
                <Send className="h-6 w-6 text-primary" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-foreground leading-tight">
                  {title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDismissed(true); onClose?.(); }}
                className="shrink-0 p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Animated bottom bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
