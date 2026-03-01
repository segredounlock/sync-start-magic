import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
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
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-xl cursor-pointer group"
            onClick={handleBannerClick}
          >
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-gradient-x" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_70%)]" />
            
            {/* Subtle shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

            {/* Content */}
            <div className="relative px-5 py-4 flex items-center gap-4">
              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-sm"
              >
                <Send className="h-5 w-5 text-primary" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-foreground leading-tight flex items-center gap-1.5">
                  {title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* CTA arrow + Close */}
              <div className="shrink-0 flex items-center gap-1">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-primary/60 hidden sm:block"
                >
                  <Send className="h-4 w-4" />
                </motion.div>
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDismissed(true); onClose?.(); }}
                  className="p-1.5 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-0.5 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
