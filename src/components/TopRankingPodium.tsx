import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

interface RankUser {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  verification_badge: string | null;
  total_recargas: number;
}

/* ─── Skeleton for loading state ─── */
function RankingSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 space-y-4 overflow-visible">
      {/* Title skeleton */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-6 w-36 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-muted/40 animate-pulse" />
        </div>
      </div>

      {/* Podium skeleton: [2nd, 1st, 3rd] */}
      <div className="flex items-end justify-center gap-6 md:gap-10 pt-4 pb-2">
        {[0, 1, 2].map((i) => {
          const isCenter = i === 1;
          return (
            <motion.div
              key={i}
              className={`flex flex-col items-center gap-2 ${isCenter ? "mb-6" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {isCenter && <div className="w-9 h-9 -mb-3" />}
              <div className={`${isCenter ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20"} rounded-full bg-muted/40 animate-pulse`} />
              <div className="flex flex-col items-center gap-1">
                <div className={`${isCenter ? "w-20" : "w-16"} h-3 bg-muted/40 rounded animate-pulse`} />
                <div className="w-14 h-2.5 bg-muted/30 rounded animate-pulse" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* User position skeleton */}
      <div className="flex items-center justify-center pt-2">
        <div className="flex items-center gap-2 bg-muted/20 rounded-full px-5 py-2.5">
          <div className="w-16 h-3 bg-muted/40 rounded animate-pulse" />
          <div className="w-8 h-6 bg-muted/40 rounded-full animate-pulse" />
          <div className="w-9 h-9 bg-muted/40 rounded-full animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="w-20 h-3 bg-muted/40 rounded animate-pulse" />
            <div className="w-14 h-2 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Gold Floating Crown (1st place) ─── */
function GoldFloatingCrown({ size = 48 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style", willChange: "transform" }}
      animate={{ y: [0, -4, 0], rotate: [0, -3, 3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Orbiting particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "50%", left: "50%", overflow: "visible" }}
          animate={{
            x: [0, Math.cos((i * 60 * Math.PI) / 180) * 28],
            y: [0, Math.sin((i * 60 * Math.PI) / 180) * 28],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
        >
          <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_3px_1px_rgba(253,224,71,0.4)]" />
        </motion.div>
      ))}

      {/* Pulsing radial glow */}
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 65%)" }}
        animate={{ scale: [1.2, 1.4, 1.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Crown icon with gradient stroke */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <Crown
          className="absolute inset-0 w-full h-full text-yellow-400"
          fill="currentColor"
          strokeWidth={0}
        />
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ filter: "drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))" }}
        >
          <defs>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <motion.path
            d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z M5 21a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1"
            fill="none"
            stroke="url(#crownGradient)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ strokeDasharray: 100, strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Silver Ice Badge (2nd place) ─── */
function SilverIceBadge({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style", overflow: "visible" }}
      animate={{ y: [0, -2, 0], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {/* Orbiting ice crystals around medal */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "50%", left: "50%", overflow: "visible" }}
          animate={{
            x: [0, Math.cos((i * 72 * Math.PI) / 180) * 22],
            y: [0, Math.sin((i * 72 * Math.PI) / 180) * 22],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
        >
          <div className="w-1.5 h-1.5 bg-gradient-to-br from-white to-blue-200 rotate-45 shadow-[0_0_6px_2px_rgba(200,220,255,0.7)]" />
        </motion.div>
      ))}

      {/* Icy ring glow */}
      <motion.div
        className="absolute inset-[-6px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(200,220,255,0.4) 0%, transparent 70%)", filter: "blur(3px)" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Medal icon only */}
      <Medal className="w-4 h-4 text-gray-300 drop-shadow-[0_0_4px_rgba(200,220,255,0.8)]" strokeWidth={2.5} />
    </motion.div>
  );
}

/* ─── Bronze Fire Badge (3rd place) ─── */
function BronzeFireBadge({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style", overflow: "visible" }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Orbiting embers around medal */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "50%", left: "50%", overflow: "visible" }}
          animate={{
            x: [0, Math.cos((i * 60 * Math.PI) / 180) * 22],
            y: [0, Math.sin((i * 60 * Math.PI) / 180) * 22],
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
        >
          <div className="w-1 h-1 rounded-full bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-200 shadow-[0_0_4px_2px_rgba(255,150,50,0.8)]" />
        </motion.div>
      ))}

      {/* Pulsing fire glow */}
      <motion.div
        className="absolute inset-[-6px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,120,50,0.5) 0%, transparent 65%)", filter: "blur(4px)" }}
        animate={{ scale: [1, 1.3, 1.1, 1.4, 1], opacity: [0.7, 0.4, 0.6, 0.3, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Medal icon only */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1.05, 1.12, 1], rotate: [0, -3, 3, -2, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <Medal className="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(255,120,50,0.9)]" strokeWidth={2.5} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Avatar Star Flash ─── */
function AvatarFlash({ index }: { index: number }) {
  const colors = [
    "linear-gradient(transparent, rgba(255,215,0,0.9), transparent)",
    "linear-gradient(transparent, rgba(220,220,230,0.9), transparent)",
    "linear-gradient(transparent, rgba(215,145,60,0.9), transparent)",
  ];
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay: index * 0.7 }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-full" style={{ background: colors[index] }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5" style={{ background: colors[index] }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: index === 0 ? "rgba(255,215,0,0.9)" : index === 1 ? "rgba(220,220,230,0.9)" : "rgba(215,145,60,0.9)" }} />
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function CountUp({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), value);
        setDisplay(current);
        if (step >= steps) clearInterval(interval);
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return <>{display}</>;
}

/* ─── Main Component ─── */
interface TopRankingPodiumProps {
  userId: string;
  onViewFull?: () => void;
  showPodium?: boolean;
  hideList?: boolean;
}

export function TopRankingPodium({ userId, onViewFull, showPodium = true, hideList = false }: TopRankingPodiumProps) {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [userPosition, setUserPosition] = useState<{ rank: number; user: RankUser } | null>(null);
  const refreshInFlightRef = useRef(false);

  const loadRanking = useCallback(async ({ showLoader = false }: { showLoader?: boolean } = {}) => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    if (showLoader) setLoading(true);

    try {
      const { data } = await supabase.rpc("get_recargas_ranking" as any, { _limit: 50 });
      const all = (data || []) as RankUser[];
      setRanking(all.slice(0, 20));

      const idx = all.findIndex((r) => r.user_id === userId);
      if (idx >= 0) {
        setUserPosition({ rank: idx, user: all[idx] });
      } else {
        const { data: countData } = await supabase.rpc("get_user_recargas_count" as any, { _user_id: userId });
        if (countData !== null && countData !== undefined) {
          const count = Number(countData);
          const approxRank = all.filter((r) => r.total_recargas > count).length;
          const { data: profile } = await supabase
            .from("profiles_public")
            .select("nome, avatar_url, verification_badge")
            .eq("id", userId)
            .maybeSingle();

          setUserPosition({
            rank: approxRank,
            user: {
              user_id: userId,
              nome: profile?.nome || "Você",
              avatar_url: profile?.avatar_url || null,
              verification_badge: profile?.verification_badge || null,
              total_recargas: count,
            },
          });
        } else {
          setUserPosition(null);
        }
      }

      setRevealed(true);
    } finally {
      if (showLoader) setLoading(false);
      refreshInFlightRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    loadRanking({ showLoader: true });

    const refreshInterval = window.setInterval(() => {
      loadRanking();
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadRanking();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadRanking]);

  if (loading) return <RankingSkeleton />;
  if (ranking.length < 3) return null;

  const topUsers = ranking.slice(0, 3);
  const userRank = userPosition?.rank ?? -1;

  // Podium order: [2nd, 1st, 3rd]
  const podiumOrder = [topUsers[1], topUsers[0], topUsers[2]];

  const getPodiumConfig = (displayIndex: number) => {
    switch (displayIndex) {
      case 0: return { position: 2, avatarSize: "w-16 h-16 md:w-20 md:h-20", ringColor: "ring-gray-300/60", badge: <SilverIceBadge size={24} /> };
      case 1: return { position: 1, avatarSize: "w-20 h-20 md:w-24 md:h-24", ringColor: "ring-yellow-500/70", badge: <GoldFloatingCrown size={36} /> };
      case 2: return { position: 3, avatarSize: "w-16 h-16 md:w-20 md:h-20", ringColor: "ring-orange-600/60", badge: <BronzeFireBadge size={24} /> };
      default: return { position: 0, avatarSize: "w-16 h-16", ringColor: "ring-muted", badge: null };
    }
  };

  // Staggered entrance: 1st appears first (center), then 2nd, then 3rd
  const entranceOrder = [1, 0, 2]; // center first, then left, then right
  const entranceDelays = [0, 0.25, 0.45];

  return (
    <AnimatePresence>
      <motion.div
        className="glass-card rounded-xl p-4 space-y-4 overflow-visible"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Title bar */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5">
            {/* Trophy with ghost glow + bounce */}
            <motion.div
              animate={{ y: [0, -3, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              className="relative shrink-0"
            >
              <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-7 h-7 text-yellow-300 blur-[2px]" />
              </motion.div>
            </motion.div>

            <h2 className="relative text-xl md:text-2xl font-extrabold overflow-hidden tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
                Top Recargas
              </span>
              <motion.span
                className="absolute inset-0 text-transparent bg-clip-text pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(90deg, transparent 0%, transparent 35%, rgba(255,255,255,0.9) 50%, transparent 65%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["200% center", "-200% center"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                Top Recargas
              </motion.span>
            </h2>

            {/* Ranking badge */}
            <motion.span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-xs font-bold shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
            >
              <Trophy className="w-3.5 h-3.5" />
              Ranking
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </motion.span>
          </div>

          {onViewFull && (
            <div className="relative shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/40 to-amber-500/40 blur-lg"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <button
                onClick={onViewFull}
                className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Ranking
                <span className="relative ml-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Podium: [2nd, 1st, 3rd] with dramatic entrance */}
        {showPodium && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10 pt-4 pb-2">
          {podiumOrder.map((user, displayIndex) => {
            const config = getPodiumConfig(displayIndex);
            const isCenter = displayIndex === 1;
            const delay = entranceDelays[displayIndex];

            return (
              <motion.div
                key={user.user_id}
                className={`flex flex-col items-center gap-2 cursor-pointer ${isCenter ? "mb-4" : "mb-0"}`}
                style={{ flexShrink: 0 }}
                initial={{ opacity: 0, y: 60, scale: 0.5 }}
                animate={revealed ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  delay,
                  type: "spring",
                  stiffness: 180,
                  damping: 16,
                  mass: isCenter ? 1.2 : 1,
                }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(`/perfil/${user.user_id}`)}
              >
                {/* Crown above avatar for 1st place only — sits on top of avatar */}
                {isCenter && (
                  <motion.div
                    className="-mb-5 z-10"
                    initial={{ opacity: 0, y: -20, scale: 0 }}
                    animate={revealed ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
                  >
                    <GoldFloatingCrown size={32} />
                  </motion.div>
                )}

                {/* Avatar container */}
                <div className="relative">
                  {/* Golden aura glow for 1st place */}
                  {isCenter && (
                    <>
                      <motion.div
                        className="absolute inset-[-12px] rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.15) 40%, transparent 70%)",
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={revealed ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] } : {}}
                        transition={{ delay: 0.6, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute inset-[-6px] rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 60%)",
                          filter: "blur(8px)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={revealed ? { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] } : {}}
                        transition={{ delay: 0.7, duration: 1.8, repeat: Infinity }}
                      />
                    </>
                  )}

                  <motion.div
                    className={`relative ${config.avatarSize} rounded-full ring-2 ${config.ringColor} overflow-visible`}
                    initial={{ scale: 0 }}
                    animate={revealed ? { scale: 1 } : {}}
                    transition={{ delay: delay + 0.1, type: "spring", stiffness: 250, damping: 18 }}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nome}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-xl">
                        {(user.nome?.[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <AvatarFlash index={config.position - 1} />

                    {/* Medal badge on top-right for 2nd/3rd */}
                    {!isCenter && (
                      <motion.div
                        className="absolute -top-1 -right-1 z-10"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={revealed ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: delay + 0.3, type: "spring", stiffness: 300, damping: 15 }}
                      >
                        {config.badge}
                      </motion.div>
                    )}

                  </motion.div>
                </div>

                {/* Name + count with staggered fade */}
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={revealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: delay + 0.3, duration: 0.3 }}
                >
                  <p className={`flex items-center justify-center gap-1 font-semibold truncate ${isCenter ? "max-w-[140px] md:max-w-[200px] text-sm md:text-base text-foreground" : "max-w-[80px] md:max-w-[140px] text-xs md:text-sm text-muted-foreground"}`} title={user.nome}>
                    <span className="truncate">{isCenter ? user.nome : (user.nome?.length > 8 ? user.nome.slice(0, 8) + "…" : user.nome)}</span>
                    {user.verification_badge && <VerificationBadge badge={user.verification_badge as BadgeType} size="xs" />}
                  </p>
                  <span className={`text-xs ${isCenter ? "text-yellow-500 font-bold" : "text-muted-foreground"}`}>
                    <span className={`font-mono font-bold tabular-nums ${isCenter ? "text-base" : "text-sm"}`}>
                      <CountUp value={user.total_recargas} delay={(delay + 0.4) * 1000} />
                    </span>
                    {" "}recargas
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Full list when podium is hidden — show all positions including top 3 */}
        {!showPodium && ranking.length > 0 && (
          <div className="space-y-1 pt-2">
            {ranking.map((user, i) => {
              const position = i + 1;
              const isCurrentUser = user.user_id === userId;
              const isTopThree = i < 3;
              const rowStyles = [
                "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-500",
                "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400",
                "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-l-amber-600",
              ];
              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/perfil/${user.user_id}`)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isCurrentUser
                      ? "bg-primary/10 border border-primary/30"
                      : isTopThree
                      ? rowStyles[i]
                      : "hover:bg-secondary/60"
                  }`}
                >
                  {/* Ribbon "Você" */}
                  {isCurrentUser && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className="bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-sm">
                        Você
                      </div>
                    </div>
                  )}
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    i === 1 ? "bg-gray-400/20 text-gray-300" :
                    i === 2 ? "bg-orange-500/20 text-orange-400" :
                    "bg-muted text-muted-foreground"
                  }`}>{position}</span>
                  <div className="relative" style={{ overflow: "visible" }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className={`${isTopThree ? "w-11 h-11" : "w-9 h-9"} rounded-full object-cover ring-1 ring-border`} />
                    ) : (
                      <div className={`${isTopThree ? "w-11 h-11" : "w-9 h-9"} rounded-full bg-destructive/80 flex items-center justify-center text-destructive-foreground font-bold text-sm ring-1 ring-border`}>
                        {(user.nome?.[0] || "?").toUpperCase()}
                      </div>
                    )}
                    {isTopThree && <AvatarFlash index={i} />}
                    {i === 0 && (
                      <motion.div className="absolute -top-4 inset-x-0 flex justify-center z-10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                        <GoldFloatingCrown size={22} />
                      </motion.div>
                    )}
                    {i === 1 && (
                      <motion.div className="absolute -top-1 -left-1.5 z-10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}>
                        <SilverIceBadge size={16} />
                      </motion.div>
                    )}
                    {i === 2 && (
                      <motion.div className="absolute -top-1 -left-1.5 z-10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}>
                        <BronzeFireBadge size={16} />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      <span className="truncate">{user.nome}</span>
                      {user.verification_badge && <VerificationBadge badge={user.verification_badge as BadgeType} size="xs" />}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold ${isTopThree ? "text-base" : "text-sm"} text-destructive`}>{user.total_recargas}</span>
                    <p className="text-[9px] text-muted-foreground uppercase">recargas</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Top 20 List (positions 4-20) — only when podium is shown */}
        {showPodium && !hideList && ranking.length > 3 && (
          <div className="space-y-1 pt-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground px-1 pb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Top {Math.min(ranking.length, 20)} Recargas
            </h3>
            {ranking.slice(3).map((user, i) => {
              const position = i + 4;
              const isCurrentUser = user.user_id === userId;
              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.03 }}
                  onClick={() => navigate(`/perfil/${user.user_id}`)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isCurrentUser
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground font-semibold w-4 text-right">{position}</span>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-border" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-destructive/80 flex items-center justify-center text-destructive-foreground font-bold text-sm ring-1 ring-border">
                      {(user.nome?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      {user.nome}
                      {user.verification_badge && <VerificationBadge badge={user.verification_badge as BadgeType} size="xs" />}
                      {isCurrentUser && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold ml-1">Você</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-destructive">{user.total_recargas}</span>
                    <p className="text-[9px] text-muted-foreground uppercase">recargas</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* User position bar */}
        {userRank >= 0 && userPosition && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center justify-center pt-2"
          >
            <div className="flex items-center gap-2 md:gap-3 bg-secondary/80 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2.5 border border-border shadow-lg">
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Sua posição:</span>
              <motion.span
                className="bg-destructive text-destructive-foreground font-bold text-xs md:text-sm min-w-[24px] md:min-w-[32px] text-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 300, damping: 12 }}
              >
                {userRank + 1}º
              </motion.span>
              {userPosition.user.avatar_url ? (
                <img src={userPosition.user.avatar_url} alt="" className="h-7 w-7 md:h-9 md:w-9 rounded-full ring-1 md:ring-2 ring-border object-cover" />
              ) : (
                <div className="h-7 w-7 md:h-9 md:w-9 rounded-full ring-1 md:ring-2 ring-border bg-muted flex items-center justify-center text-foreground font-bold text-[10px] md:text-xs">
                  {(userPosition.user.nome?.[0] || "?").toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-semibold text-foreground leading-tight">{userPosition.user.nome}</span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground leading-tight">{userPosition.user.total_recargas} recargas</span>
              </div>
              <span className="text-[10px] md:text-xs bg-primary/20 text-primary px-1.5 md:px-2 py-0.5 rounded-full font-semibold">Você</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
