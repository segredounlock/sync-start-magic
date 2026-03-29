import { useEffect, useRef, useState } from "react";
import { useSiteName } from "@/hooks/useSiteName";
import { useSiteLogo } from "@/hooks/useSiteLogo";

/** Floating particle spawned by the canvas */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  decay: number;
}

export function SplashScreen() {
  const logo = useSiteLogo();
  const siteName = useSiteName();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const frameRef = useRef(0);

  /* ── Canvas particle system ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles: Particle[] = [];
    let raf = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const spawn = () => {
      const cx = w / 2;
      const cy = h / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        alpha: 0.6 + Math.random() * 0.4,
        decay: 0.003 + Math.random() * 0.006,
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      // spawn 1-2 particles per frame
      if (particles.length < 60) {
        spawn();
        if (Math.random() > 0.5) spawn();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        // primary green glow
        ctx.fillStyle = `hsla(152, 72%, 46%, ${p.alpha})`;
        ctx.shadowColor = "hsla(152, 72%, 46%, 0.6)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Progress counter ── */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        // accelerate near the end
        const step = p < 70 ? Math.random() * 8 + 2 : Math.random() * 4 + 1;
        return Math.min(100, p + step);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  /* ── Frame counter for subtle oscillation ── */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      frameRef.current++;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(160 30% 4%)" }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 340,
            height: 340,
            background: "radial-gradient(circle, hsla(152,72%,46%,0.12) 0%, transparent 70%)",
            animation: "splash-glow-pulse 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Logo with ring animation */}
      <div className="relative z-10" style={{ animation: "splash-logo-enter 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Spinning ring */}
        <svg
          className="absolute -inset-3"
          viewBox="0 0 140 140"
          style={{ animation: "splash-ring-spin 4s linear infinite" }}
        >
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsla(152,72%,46%,0.8)" />
              <stop offset="50%" stopColor="hsla(152,72%,46%,0)" />
              <stop offset="100%" stopColor="hsla(152,72%,46%,0.4)" />
            </linearGradient>
          </defs>
          <circle
            cx="70" cy="70" r="64"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="120 280"
          />
        </svg>

        {/* Logo container */}
        <div
          className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-border/30"
          style={{
            boxShadow: "0 0 40px hsla(152,72%,46%,0.15), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <img
            src={logo}
            alt={siteName}
            className="w-full h-full object-cover"
            loading="eager"
            onLoad={() => setLogoLoaded(true)}
            style={{
              opacity: logoLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Brand name with shimmer */}
      <h1
        className="relative z-10 mt-5 text-lg font-bold tracking-wider"
        style={{
          animation: "splash-text-enter 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both",
          background: "linear-gradient(110deg, hsl(150,15%,92%) 40%, hsl(152,72%,55%) 50%, hsl(150,15%,92%) 60%)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          animationName: "splash-text-enter, splash-shimmer-text",
          animationDuration: "0.6s, 3s",
          animationDelay: "0.3s, 1s",
          animationTimingFunction: "cubic-bezier(0.16,1,0.3,1), ease-in-out",
          animationFillMode: "both, none",
          animationIterationCount: "1, infinite",
        }}
      >
        {siteName}
      </h1>

      {/* Progress bar */}
      <div
        className="relative z-10 mt-6 w-48 h-1 rounded-full overflow-hidden"
        style={{
          background: "hsla(152,72%,46%,0.1)",
          animation: "splash-text-enter 0.5s 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, hsl(152,72%,46%), hsl(152,85%,60%))",
            boxShadow: "0 0 12px hsla(152,72%,46%,0.5)",
            transition: "width 0.15s ease-out",
          }}
        />
      </div>

      {/* Status text */}
      <p
        className="z-10 mt-3 text-xs font-medium tracking-wide"
        style={{
          color: "hsla(150,8%,50%,0.8)",
          animation: "splash-text-enter 0.5s 0.6s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        Carregando… {Math.round(progress)}%
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes splash-logo-enter {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-text-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-ring-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes splash-glow-pulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50%      { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }
        @keyframes splash-shimmer-text {
          0%, 100% { background-position: 200% center; }
          50%      { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
