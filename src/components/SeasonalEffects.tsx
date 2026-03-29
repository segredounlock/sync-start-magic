import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export type SeasonalThemeKey =
  | "none"
  | "ano_novo"
  | "carnaval"
  | "pascoa"
  | "dia_maes"
  | "dia_namorados"
  | "festa_junina"
  | "dia_pais"
  | "dia_criancas"
  | "black_friday"
  | "natal";

export interface SeasonalThemeConfig {
  key: SeasonalThemeKey;
  label: string;
  emoji: string;
  description: string;
  particles: string[];
  accentGradient: string;
  glowColor: string;
}

export const SEASONAL_THEMES: SeasonalThemeConfig[] = [
  { key: "none", label: "Nenhum", emoji: "⚪", description: "Tema padrão sem efeitos sazonais", particles: [], accentGradient: "", glowColor: "" },
  { key: "ano_novo", label: "Feliz Ano Novo", emoji: "🎆", description: "Réveillon — Fogos e champagne", particles: ["🎆", "✨", "🥂", "🎇", "⭐", "💫"], accentGradient: "from-yellow-400 via-amber-500 to-purple-600", glowColor: "rgba(234, 179, 8, 0.15)" },
  { key: "carnaval", label: "Feliz Carnaval", emoji: "🎭", description: "Folia, confete e serpentina", particles: ["🎭", "🎉", "🎊", "💃", "🪇", "🌈"], accentGradient: "from-green-400 via-yellow-400 to-pink-500", glowColor: "rgba(168, 85, 247, 0.15)" },
  { key: "pascoa", label: "Feliz Páscoa", emoji: "🐰", description: "Coelhinhos e ovos de chocolate", particles: ["🐰", "🥚", "🌸", "🐣", "🍫", "🌷"], accentGradient: "from-pink-300 via-purple-300 to-blue-300", glowColor: "rgba(196, 181, 253, 0.15)" },
  { key: "dia_maes", label: "Feliz Dia das Mães", emoji: "💐", description: "Flores e amor materno", particles: ["💐", "🌹", "❤️", "🌸", "💕", "🌺"], accentGradient: "from-pink-400 via-rose-400 to-red-400", glowColor: "rgba(244, 114, 182, 0.15)" },
  { key: "dia_namorados", label: "Feliz Dia dos Namorados", emoji: "💕", description: "Corações e romance", particles: ["💕", "💘", "❤️", "💖", "💝", "🥰"], accentGradient: "from-red-400 via-pink-500 to-rose-500", glowColor: "rgba(239, 68, 68, 0.12)" },
  { key: "festa_junina", label: "Feliz Festa Junina", emoji: "🎪", description: "Bandeirinhas e fogueira", particles: ["🎪", "🌽", "🔥", "🪗", "🎏", "⛺"], accentGradient: "from-orange-400 via-yellow-500 to-red-500", glowColor: "rgba(249, 115, 22, 0.15)" },
  { key: "dia_pais", label: "Feliz Dia dos Pais", emoji: "👔", description: "Homenagem aos pais", particles: ["👔", "⭐", "🏆", "💪", "🎖️", "💙"], accentGradient: "from-blue-400 via-sky-500 to-indigo-500", glowColor: "rgba(59, 130, 246, 0.12)" },
  { key: "dia_criancas", label: "Feliz Dia das Crianças", emoji: "🎈", description: "Balões e diversão", particles: ["🎈", "🎮", "🌈", "🧸", "🎠", "🍭"], accentGradient: "from-cyan-400 via-green-400 to-yellow-400", glowColor: "rgba(34, 211, 238, 0.12)" },
  { key: "black_friday", label: "Black Friday", emoji: "🏷️", description: "Ofertas e descontos", particles: ["🏷️", "💰", "🔥", "⚡", "💸", "🤑"], accentGradient: "from-gray-900 via-yellow-500 to-gray-900", glowColor: "rgba(234, 179, 8, 0.1)" },
  { key: "natal", label: "Feliz Natal", emoji: "🎄", description: "Papai Noel e neve", particles: ["🎄", "❄️", "🎅", "⭐", "🎁", "☃️"], accentGradient: "from-red-500 via-green-500 to-red-500", glowColor: "rgba(34, 197, 94, 0.12)" },
];

// ═══════════════════════════════════════════════════════════
// Canvas-based particle systems per theme
// ═══════════════════════════════════════════════════════════

interface CanvasParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
  maxLife: number;
  type: string;
}

function createParticlesForTheme(theme: SeasonalThemeKey, w: number, h: number): CanvasParticle[] {
  const particles: CanvasParticle[] = [];
  const count = Math.min(Math.floor(w / 40), 30); // responsive count

  const makeBase = (): Omit<CanvasParticle, "color" | "type"> => ({
    x: Math.random() * w,
    y: Math.random() * h - h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0.3 + Math.random() * 1,
    size: 3 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.7,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.03,
    life: 0,
    maxLife: 600 + Math.random() * 400,
  });

  switch (theme) {
    case "natal": // Snowflakes
      for (let i = 0; i < count; i++) {
        particles.push({ ...makeBase(), vx: (Math.random() - 0.5) * 0.8, vy: 0.3 + Math.random() * 0.8, size: 2 + Math.random() * 4, color: `rgba(255,255,255,${0.4 + Math.random() * 0.6})`, type: "snow" });
      }
      break;
    case "ano_novo": // Firework sparkles
      for (let i = 0; i < count; i++) {
        const hue = [45, 50, 280, 320, 0][Math.floor(Math.random() * 5)];
        particles.push({ ...makeBase(), vy: -0.5 + Math.random() * 1.5, vx: (Math.random() - 0.5) * 2, size: 1 + Math.random() * 3, color: `hsla(${hue}, 100%, 70%, ${0.5 + Math.random() * 0.5})`, type: "sparkle" });
      }
      break;
    case "carnaval": // Confetti
      for (let i = 0; i < count * 1.5; i++) {
        const colors = ["#ff0080", "#ff8c00", "#40e0d0", "#ff1493", "#7b68ee", "#ffd700", "#00ff7f"];
        particles.push({ ...makeBase(), vx: (Math.random() - 0.5) * 2, vy: 0.5 + Math.random() * 1.5, size: 3 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)], type: "confetti" });
      }
      break;
    case "dia_namorados":
    case "dia_maes": // Floating hearts / petals
      for (let i = 0; i < count; i++) {
        const colors = theme === "dia_namorados" ? ["#ff4d6d", "#ff758f", "#ff87ab", "#c9184a"] : ["#f472b6", "#fb7185", "#fda4af", "#e11d48"];
        particles.push({ ...makeBase(), vx: (Math.random() - 0.5) * 0.6, vy: 0.2 + Math.random() * 0.6, size: 4 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)], type: theme === "dia_namorados" ? "heart" : "petal" });
      }
      break;
    case "festa_junina": // Fire embers
      for (let i = 0; i < count; i++) {
        particles.push({ ...makeBase(), vy: -(0.3 + Math.random() * 1), vx: (Math.random() - 0.5) * 1.5, y: h + Math.random() * 50, size: 1.5 + Math.random() * 3, color: `hsla(${20 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%, ${0.5 + Math.random() * 0.5})`, type: "ember" });
      }
      break;
    case "pascoa": // Gentle bubbles/petals
      for (let i = 0; i < count * 0.7; i++) {
        const colors = ["#c4b5fd", "#f0abfc", "#fbcfe8", "#a5b4fc", "#bef264"];
        particles.push({ ...makeBase(), vy: 0.15 + Math.random() * 0.5, size: 3 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)], type: "bubble" });
      }
      break;
    case "black_friday": // Gold sparks
      for (let i = 0; i < count; i++) {
        particles.push({ ...makeBase(), vx: (Math.random() - 0.5) * 1.5, vy: 0.5 + Math.random(), size: 1.5 + Math.random() * 2.5, color: `hsla(${45 + Math.random() * 15}, 100%, ${60 + Math.random() * 20}%, ${0.5 + Math.random() * 0.5})`, type: "spark" });
      }
      break;
    case "dia_criancas": // Colorful floating bubbles
      for (let i = 0; i < count; i++) {
        const colors = ["#22d3ee", "#4ade80", "#facc15", "#f97316", "#a855f7", "#ec4899"];
        particles.push({ ...makeBase(), vy: -(0.1 + Math.random() * 0.4), y: h + Math.random() * 100, vx: (Math.random() - 0.5) * 0.8, size: 4 + Math.random() * 8, color: colors[Math.floor(Math.random() * colors.length)], type: "balloon" });
      }
      break;
    case "dia_pais": // Stars
      for (let i = 0; i < count * 0.6; i++) {
        particles.push({ ...makeBase(), vy: 0.1 + Math.random() * 0.3, size: 2 + Math.random() * 4, color: `hsla(${210 + Math.random() * 30}, 80%, ${60 + Math.random() * 20}%, ${0.3 + Math.random() * 0.5})`, type: "star" });
      }
      break;
    default:
      for (let i = 0; i < count; i++) {
        particles.push({ ...makeBase(), color: "rgba(255,255,255,0.5)", type: "dot" });
      }
  }
  return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: CanvasParticle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity * Math.min(1, p.life / 60) * Math.min(1, (p.maxLife - p.life) / 60);

  switch (p.type) {
    case "snow": {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Draw snowflake with 6 arms
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
      }
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "heart": {
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
      ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fill();
      break;
    }
    case "petal": {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "confetti": {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      break;
    }
    case "ember": {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, "rgba(255,100,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "sparkle": {
      ctx.fillStyle = p.color;
      // 4-point star
      const s = p.size;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s : s * 0.3;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "bubble":
    case "balloon": {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, "0.15)");
      ctx.fill();
      // Shine
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "star": {
      ctx.fillStyle = p.color;
      const st = p.size;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerA = outerA + Math.PI / 5;
        ctx.lineTo(Math.cos(outerA) * st, Math.sin(outerA) * st);
        ctx.lineTo(Math.cos(innerA) * st * 0.4, Math.sin(innerA) * st * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "spark": {
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      sg.addColorStop(0, p.color);
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ── Canvas Effect Component ──
function CanvasParticles({ theme }: { theme: SeasonalThemeKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CanvasParticle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = createParticlesForTheme(theme, canvas.width, canvas.height);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++;

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Sway for certain types
        if (p.type === "snow" || p.type === "petal" || p.type === "bubble") {
          p.x += Math.sin(p.life * 0.02 + p.rotation) * 0.3;
        }
        if (p.type === "confetti") {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.rotationSpeed += (Math.random() - 0.5) * 0.005;
        }

        // Recycle if off-screen or expired
        if (p.life > p.maxLife || p.y > canvas.height + 50 || p.y < -100 || p.x < -50 || p.x > canvas.width + 50) {
          // Reset
          p.x = Math.random() * canvas.width;
          p.life = 0;
          p.maxLife = 600 + Math.random() * 400;
          if (p.type === "ember" || p.type === "balloon") {
            p.y = canvas.height + Math.random() * 50;
          } else {
            p.y = -20 - Math.random() * 50;
          }
          p.vx = (Math.random() - 0.5) * (p.type === "confetti" ? 2 : 0.8);
        }

        drawParticle(ctx, p);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ── Banner ──
function SeasonalBanner({ theme }: { theme: SeasonalThemeConfig }) {
  return (
    <motion.div
      key={theme.key}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`w-full bg-gradient-to-r ${theme.accentGradient} overflow-hidden`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-center gap-2 py-1.5 px-4"
      >
        <span className="text-sm">{theme.emoji}</span>
        <span className="text-xs font-bold text-white drop-shadow-sm tracking-wide">
          {theme.label.toUpperCase()}
        </span>
        <span className="text-sm">{theme.emoji}</span>
      </motion.div>
    </motion.div>
  );
}

// ── Glow ──
function GlowOverlay({ color }: { color: string }) {
  return (
    <motion.div
      key={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 60%)`,
      }}
    />
  );
}

export default function SeasonalEffects() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const shouldSkip = pathname === "/miniapp" || pathname === "/" || pathname === "/login" || pathname === "/auth";

  const [activeTheme, setActiveTheme] = useState<SeasonalThemeKey>("none");
  const [displayedTheme, setDisplayedTheme] = useState<SeasonalThemeKey>("none");
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyThemeChange = useCallback((newThemeKey: SeasonalThemeKey) => {
    setActiveTheme(prev => {
      if (prev === newThemeKey) return prev;
      if (prev !== "none") {
        setExiting(true);
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          setExiting(false);
          setDisplayedTheme(newThemeKey);
        }, 2000);
      } else {
        setDisplayedTheme(newThemeKey);
      }
      return newThemeKey;
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_seasonal_theme" as any);
      if (data && data !== "none") {
        applyThemeChange(data as SeasonalThemeKey);
      }
    };
    load();

    const channel = supabase
      .channel("seasonal-theme")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "system_config",
        filter: "key=eq.seasonalTheme",
      }, (payload: any) => {
        const val = (payload.new?.value || "none") as SeasonalThemeKey;
        applyThemeChange(val);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [applyThemeChange]);

  const theme = useMemo(
    () => SEASONAL_THEMES.find(t => t.key === displayedTheme) || SEASONAL_THEMES[0],
    [displayedTheme]
  );

  if (shouldSkip) return null;
  if (displayedTheme === "none" && !exiting) return null;

  return (
    <>
      {/* Top banner */}
      <AnimatePresence mode="wait">
        {!exiting && displayedTheme !== "none" && (
          <SeasonalBanner key={theme.key} theme={theme} />
        )}
      </AnimatePresence>

      {/* Canvas-based particles — realistic JS animations */}
      {!exiting && displayedTheme !== "none" && (
        <CanvasParticles key={`canvas-${displayedTheme}`} theme={displayedTheme} />
      )}

      {/* Ambient glow */}
      <AnimatePresence>
        {!exiting && theme.glowColor && (
          <GlowOverlay key={theme.key} color={theme.glowColor} />
        )}
      </AnimatePresence>
    </>
  );
}
