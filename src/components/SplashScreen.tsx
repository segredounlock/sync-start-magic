import { useEffect, useRef, useState } from "react";
import { useSiteName } from "@/hooks/useSiteName";
import { useSiteLogo } from "@/hooks/useSiteLogo";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  decay: number;
  color: string;
}

interface BgParticle {
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
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const disintCanvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [disintegrating, setDisintegrating] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const disintParticlesRef = useRef<Particle[]>([]);

  /* ── Background particle system ── */
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles: BgParticle[] = [];
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
      if (particles.length < 60) {
        spawn();
        if (Math.random() > 0.5) spawn();
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(152, 72%, 46%, ${p.alpha})`;
        ctx.shadowColor = "hsla(152, 72%, 46%, 0.6)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  /* ── Build disintegration particles from logo pixels ── */
  useEffect(() => {
    if (!logoLoaded || !logoRef.current) return;

    const img = logoRef.current;
    const size = 112; // canvas sample size
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const octx = offscreen.getContext("2d");
    if (!octx) return;

    // Need crossOrigin — draw may fail for external URLs, fallback gracefully
    const drawImg = new Image();
    drawImg.crossOrigin = "anonymous";
    drawImg.onload = () => {
      octx.drawImage(drawImg, 0, 0, size, size);
      let imageData: ImageData;
      try {
        imageData = octx.getImageData(0, 0, size, size);
      } catch {
        // tainted canvas — use solid color particles as fallback
        const particles: Particle[] = [];
        const step = 3;
        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            particles.push({
              x, y, originX: x, originY: y,
              vx: 0, vy: 0, r: step / 2,
              alpha: 1, decay: 0,
              color: "hsl(152, 72%, 46%)",
            });
          }
        }
        disintParticlesRef.current = particles;
        setParticlesReady(true);
        return;
      }

      const pixels = imageData.data;
      const particles: Particle[] = [];
      const step = 3;

      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const i = (y * size + x) * 4;
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
          if (a < 30) continue; // skip transparent
          particles.push({
            x, y, originX: x, originY: y,
            vx: 0, vy: 0, r: step / 2,
            alpha: 1, decay: 0,
            color: `rgba(${r},${g},${b},${a / 255})`,
          });
        }
      }
      disintParticlesRef.current = particles;
      setParticlesReady(true);
    };
    drawImg.onerror = () => {
      // fallback: green particles in a square
      const particles: Particle[] = [];
      const step = 3;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          particles.push({
            x, y, originX: x, originY: y,
            vx: 0, vy: 0, r: step / 2,
            alpha: 1, decay: 0,
            color: "hsl(152, 72%, 46%)",
          });
        }
      }
      disintParticlesRef.current = particles;
      setParticlesReady(true);
    };
    drawImg.src = img.src;
  }, [logoLoaded]);

  /* ── Trigger disintegration at ~7s ── */
  useEffect(() => {
    const timer = setTimeout(() => setDisintegrating(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  /* ── Disintegration animation ── */
  useEffect(() => {
    if (!disintegrating || !particlesReady) return;
    const canvas = disintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 112;
    canvas.width = size;
    canvas.height = size;

    const particles = disintParticlesRef.current;

    // Assign random velocities for disintegration
    for (const p of particles) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      p.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
      p.vy = Math.sin(angle) * speed - Math.random() * 1.5;
      p.decay = 0.008 + Math.random() * 0.012;
    }

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, size, size);
      let alive = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // slight gravity
        p.vx *= 0.99;
        p.alpha -= p.decay;
        if (p.alpha <= 0) continue;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      if (alive > 0) {
        raf = requestAnimationFrame(loop);
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [disintegrating, particlesReady]);

  /* ── Progress counter — ~10s ── */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const DURATION = 10_000;
    const INTERVAL = 150;
    const TOTAL_TICKS = DURATION / INTERVAL;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      const ratio = tick / TOTAL_TICKS;
      const eased = 1 - Math.pow(1 - ratio, 2.5);
      const value = Math.min(100, eased * 100);
      setProgress(value);
      if (tick >= TOTAL_TICKS) clearInterval(interval);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const showDisintCanvas = disintegrating && particlesReady;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(160 30% 4%)" }}
    >
      {/* Background particle canvas */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.7 }} />

      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 340, height: 340,
            background: "radial-gradient(circle, hsla(152,72%,46%,0.12) 0%, transparent 70%)",
            animation: "splash-glow-pulse 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Logo with ring + disintegration */}
      <div className="relative z-10" style={{ animation: "splash-logo-enter 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Spinning ring */}
        <svg className="absolute -inset-3" viewBox="0 0 140 140"
          style={{ animation: "splash-ring-spin 4s linear infinite", opacity: showDisintCanvas ? 0 : 1, transition: "opacity 0.5s" }}
        >
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsla(152,72%,46%,0.8)" />
              <stop offset="50%" stopColor="hsla(152,72%,46%,0)" />
              <stop offset="100%" stopColor="hsla(152,72%,46%,0.4)" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r="64" fill="none" stroke="url(#ring-grad)"
            strokeWidth="2" strokeLinecap="round" strokeDasharray="120 280" />
        </svg>

        {/* Logo image (hidden when disintegrating) */}
        <div
          className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-border/30"
          style={{
            boxShadow: "0 0 40px hsla(152,72%,46%,0.15), 0 8px 32px rgba(0,0,0,0.4)",
            opacity: showDisintCanvas ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <img
            ref={logoRef}
            src={logo}
            alt={siteName}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            loading="eager"
            onLoad={() => setLogoLoaded(true)}
            style={{ opacity: logoLoaded ? 1 : 0, transition: "opacity 0.4s ease" }}
          />
        </div>

        {/* Disintegration canvas (same size as logo) */}
        {showDisintCanvas && (
          <canvas
            ref={disintCanvasRef}
            className="absolute top-0 left-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl"
            style={{ imageRendering: "pixelated" }}
          />
        )}
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
            width: `${progress || 0}%`,
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
        Carregando… {Math.round(progress || 0)}%
      </p>

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
