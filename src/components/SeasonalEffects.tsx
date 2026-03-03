import { useEffect, useState, useMemo } from "react";
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
  { key: "ano_novo", label: "Ano Novo", emoji: "🎆", description: "Réveillon — Fogos e champagne", particles: ["🎆", "✨", "🥂", "🎇", "⭐", "💫"], accentGradient: "from-yellow-400 via-amber-500 to-purple-600", glowColor: "rgba(234, 179, 8, 0.15)" },
  { key: "carnaval", label: "Carnaval", emoji: "🎭", description: "Folia, confete e serpentina", particles: ["🎭", "🎉", "🎊", "💃", "🪇", "🌈"], accentGradient: "from-green-400 via-yellow-400 to-pink-500", glowColor: "rgba(168, 85, 247, 0.15)" },
  { key: "pascoa", label: "Páscoa", emoji: "🐰", description: "Coelhinhos e ovos de chocolate", particles: ["🐰", "🥚", "🌸", "🐣", "🍫", "🌷"], accentGradient: "from-pink-300 via-purple-300 to-blue-300", glowColor: "rgba(196, 181, 253, 0.15)" },
  { key: "dia_maes", label: "Dia das Mães", emoji: "💐", description: "Flores e amor materno", particles: ["💐", "🌹", "❤️", "🌸", "💕", "🌺"], accentGradient: "from-pink-400 via-rose-400 to-red-400", glowColor: "rgba(244, 114, 182, 0.15)" },
  { key: "dia_namorados", label: "Dia dos Namorados", emoji: "💕", description: "Corações e romance", particles: ["💕", "💘", "❤️", "💖", "💝", "🥰"], accentGradient: "from-red-400 via-pink-500 to-rose-500", glowColor: "rgba(239, 68, 68, 0.12)" },
  { key: "festa_junina", label: "Festa Junina", emoji: "🎪", description: "Bandeirinhas e fogueira", particles: ["🎪", "🌽", "🔥", "🪗", "🎏", "⛺"], accentGradient: "from-orange-400 via-yellow-500 to-red-500", glowColor: "rgba(249, 115, 22, 0.15)" },
  { key: "dia_pais", label: "Dia dos Pais", emoji: "👔", description: "Homenagem aos pais", particles: ["👔", "⭐", "🏆", "💪", "🎖️", "💙"], accentGradient: "from-blue-400 via-sky-500 to-indigo-500", glowColor: "rgba(59, 130, 246, 0.12)" },
  { key: "dia_criancas", label: "Dia das Crianças", emoji: "🎈", description: "Balões e diversão", particles: ["🎈", "🎮", "🌈", "🧸", "🎠", "🍭"], accentGradient: "from-cyan-400 via-green-400 to-yellow-400", glowColor: "rgba(34, 211, 238, 0.12)" },
  { key: "black_friday", label: "Black Friday", emoji: "🏷️", description: "Ofertas e descontos", particles: ["🏷️", "💰", "🔥", "⚡", "💸", "🤑"], accentGradient: "from-gray-900 via-yellow-500 to-gray-900", glowColor: "rgba(234, 179, 8, 0.1)" },
  { key: "natal", label: "Natal", emoji: "🎄", description: "Papai Noel e neve", particles: ["🎄", "❄️", "🎅", "⭐", "🎁", "☃️"], accentGradient: "from-red-500 via-green-500 to-red-500", glowColor: "rgba(34, 197, 94, 0.12)" },
];

function Particle({ emoji, delay, duration, x, size }: { emoji: string; delay: number; duration: number; x: number; size: number }) {
  return (
    <motion.div
      className="fixed pointer-events-none select-none z-[9999]"
      initial={{ top: -40, left: `${x}%`, opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{
        top: "110vh",
        opacity: [0, 1, 1, 0.5, 0],
        scale: [0.5, 1, 0.8],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ fontSize: size }}
    >
      {emoji}
    </motion.div>
  );
}

function SeasonalBanner({ theme }: { theme: SeasonalThemeConfig }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`w-full bg-gradient-to-r ${theme.accentGradient} overflow-hidden`}
    >
      <div className="flex items-center justify-center gap-2 py-1.5 px-4">
        <span className="text-sm">{theme.emoji}</span>
        <span className="text-xs font-bold text-white drop-shadow-sm tracking-wide">
          {theme.label.toUpperCase()}
        </span>
        <span className="text-sm">{theme.emoji}</span>
      </div>
    </motion.div>
  );
}

export default function SeasonalEffects() {
  const [activeTheme, setActiveTheme] = useState<SeasonalThemeKey>("none");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_seasonal_theme" as any);
      if (data && data !== "none") {
        setActiveTheme(data as SeasonalThemeKey);
      }
    };
    load();

    // Realtime updates (only works for authenticated users)
    const channel = supabase
      .channel("seasonal-theme")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "system_config",
        filter: "key=eq.seasonalTheme",
      }, (payload: any) => {
        const val = payload.new?.value || "none";
        setActiveTheme(val as SeasonalThemeKey);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const theme = useMemo(
    () => SEASONAL_THEMES.find(t => t.key === activeTheme) || SEASONAL_THEMES[0],
    [activeTheme]
  );

  const particles = useMemo(() => {
    if (activeTheme === "none" || theme.particles.length === 0) return [];
    // Generate 12 particles with random positions
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: theme.particles[i % theme.particles.length],
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      x: Math.random() * 95,
      size: 14 + Math.random() * 10,
    }));
  }, [activeTheme, theme]);

  if (activeTheme === "none") return null;

  return (
    <>
      {/* Top banner */}
      <AnimatePresence>
        <SeasonalBanner theme={theme} />
      </AnimatePresence>

      {/* Floating particles */}
      {particles.map(p => (
        <Particle key={p.id} emoji={p.emoji} delay={p.delay} duration={p.duration} x={p.x} size={p.size} />
      ))}

      {/* Ambient glow overlay */}
      {theme.glowColor && (
        <div
          className="fixed inset-0 pointer-events-none z-[9998]"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${theme.glowColor} 0%, transparent 60%)`,
          }}
        />
      )}
    </>
  );
}
