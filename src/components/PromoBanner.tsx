import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
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
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 cursor-pointer"
            onClick={handleBannerClick}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDismissed(true); onClose?.(); }}
                className="shrink-0 p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
