import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Zap, Smartphone } from "lucide-react";
import { useState } from "react";

function ShimmerTitle({ text }: { text: string }) {
  const match = text.match(/(.*?)(Recargas\s*Brasil)(.*)/i);
  if (!match) return <>{text}</>;
  const [, before, rb, after] = match;
  return <>{before}<span className="shimmer-letters">{rb.replace(/brasil/i, m => `<span class="brasil-word">${m}</span>`)
    .split(/(<span[^>]*>.*?<\/span>)/g).map((part, i) =>
      part.startsWith("<span") ? <span key={i} className="brasil-word">{part.replace(/<[^>]+>/g, "")}</span> : part
    )}</span>{after}</>;
}

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  visible?: boolean;
  link?: string;
  icon_url?: string;
  onClose?: () => void;
}

export function PromoBanner({ 
  title = "Bot do Telegram online!",
  subtitle = "Consulte saldo, faça recargas e receba notificações direto no Telegram!",
  visible = true,
  link,
  icon_url,
  onClose
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  const handleBannerClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const floatingEmojis = ["🤖", "⚡", "📱", "🚀", "💬"];

  return (
    <div className="w-full mb-4">
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative overflow-hidden rounded-2xl border border-primary/25 shadow-lg cursor-pointer group"
            onClick={handleBannerClick}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />

            {/* Floating emojis in background */}
            {floatingEmojis.map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-lg select-none pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                style={{
                  top: `${12 + (i * 18) % 70}%`,
                  left: `${10 + (i * 22) % 80}%`,
                }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, i % 2 === 0 ? 10 : -10, 0],
                }}
                transition={{
                  duration: 2.5 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                {emoji}
              </motion.span>
            ))}

            {/* Content */}
            <div className="relative px-4 py-3.5 flex items-center gap-3">
              {/* Animated Telegram icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center overflow-hidden"
              >
                {icon_url ? (
                  <img src={icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Send className="h-5 w-5 text-primary" />
                )}
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight">
                  🤖 <ShimmerTitle text={title} /> 🚀
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📱 {subtitle} ⚡💬
                </p>
              </div>

              {/* Animated side icons + close */}
              <div className="shrink-0 flex items-center gap-1.5">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-primary/50 hidden sm:block"
                >
                  <MessageCircle className="h-4 w-4" />
                </motion.div>
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDismissed(true); onClose?.(); }}
                  className="p-1 rounded-lg hover:bg-destructive/15 text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Animated bottom bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="h-[2px] bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
