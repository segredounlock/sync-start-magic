import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

function ShimmerTitle({ text }: { text: string }) {
  const match = text.match(/(.*?)(Recargas\s*Brasil)(.*)/i);
  if (!match) return <>{text}</>;
  const [, before, rb, after] = match;
  const parts = rb.split(/brasil/i);
  return <>{before}<span className="shimmer-letters">{parts[0]}<span className="brasil-word">Brasil</span></span>{after}</>;
}

interface SlideItem {
  title: string;
  subtitle: string;
  link?: string;
  icon_url?: string;
}

interface SlideBannerProps {
  slides: SlideItem[];
  autoPlayInterval?: number;
  visible?: boolean;
  onClose?: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function SlideBanner({
  slides,
  autoPlayInterval = 5000,
  visible = true,
  onClose,
}: SlideBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [paused, setPaused] = useState(false);

  const total = slides.length;

  const paginate = useCallback(
    (dir: number) => {
      setCurrent(([prev]) => [
        (prev + dir + total) % total,
        dir,
      ]);
    },
    [total],
  );

  // Auto-play
  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(() => paginate(1), autoPlayInterval);
    return () => clearInterval(id);
  }, [paused, paginate, autoPlayInterval, total]);

  if (!visible || dismissed || total === 0) return null;

  const slide = slides[current];

  const handleClick = () => {
    if (slide.link) window.open(slide.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full mb-4">
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative overflow-hidden rounded-2xl border border-primary/25 shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-accent/8" />

        {/* Animated shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.08) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Slide content */}
        <div className="relative min-h-[72px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
              onClick={handleClick}
            >
              {/* Slide indicator icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center overflow-hidden"
              >
                {slide.icon_url ? (
                  <img src={slide.icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-lg">🎞️</span>
                )}
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                  <ShimmerTitle text={slide.title || "Novidade!"} />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {slide.subtitle || "Confira as novidades"}
                </p>
              </div>

              {/* External link hint */}
              {slide.link && (
                <ExternalLink className="h-4 w-4 text-primary/50 shrink-0" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls overlay */}
        <div className="absolute top-0 right-0 flex items-center gap-1 p-2 z-10">
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
              onClose?.();
            }}
            className="p-1 rounded-lg hover:bg-destructive/15 text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dots + progress bar */}
        <div className="relative">
          {/* Progress bar */}
          <motion.div
            key={`progress-${current}`}
            className="h-[2px] bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: paused ? undefined : 1 }}
            transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
          />

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent([i, i > current ? 1 : -1]);
                  }}
                  className="transition-all duration-300"
                >
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width: i === current ? 16 : 6,
                      height: 6,
                      backgroundColor:
                        i === current
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground) / 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
