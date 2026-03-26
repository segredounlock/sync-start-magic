import logo from "@/assets/recargas-brasil-logo.jpeg";
import { useSiteName } from "@/hooks/useSiteName";

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

      {/* Logo — CSS animation instead of framer-motion for faster render */}
      <div className="relative z-10 animate-fade-in">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20">
          <img
            src={logo}
            alt="Recargas Brasil"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Animated dots — pure CSS for zero JS overhead */}
      <div className="flex gap-2 mt-6 z-10 animate-fade-in" style={{ animationDelay: '150ms' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary animate-splash-dot"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Text */}
      <p
        className="mt-4 text-sm text-muted-foreground font-medium tracking-wide z-10 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        Carregando...
      </p>
    </div>
  );
}
