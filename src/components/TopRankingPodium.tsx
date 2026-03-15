import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

interface RankUser {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  verification_badge: string | null;
  total_recargas: number;
}

/* ─── Gold Floating Crown (1st place) ─── */
function GoldFloatingCrown({ size = 40 }: { size?: number }) {
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
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 65%)" }}
        animate={{ scale: [1.2, 1.4, 1.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Crown icon with gradient stroke */}
      <div className="relative" style={{ width: size * 0.7, height: size * 0.7 }}>
        <Crown
          fill="currentColor"
          className="text-yellow-400 absolute inset-0 w-full h-full"
          strokeWidth={0}
        />
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <motion.path
            d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
            fill="none"
            stroke="url(#crownGradient)"
            strokeWidth={1.5}
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
      style={{ width: size, height: size, contain: "layout style" }}
      animate={{ y: [0, -2, 0], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {/* Ice crystals rising */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "60%", left: `${35 + i * 8}%` }}
          animate={{
            y: [0, -25], x: [(i - 2) * 4, (i - 2) * 6],
            opacity: [0, 1, 0], scale: [0.5, 1, 0.3], rotate: [0, 180],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
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

      {/* Badge with shimmer */}
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-gray-300 to-slate-400 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        />
        <Medal className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(200,220,255,0.8)]" strokeWidth={2.5} />
      </div>
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
      {/* Rising embers */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "60%", left: `${40 + (i % 3) * 10}%` }}
          animate={{
            y: [0, -30 - i * 5], x: [0, i % 2 === 0 ? 8 : -8],
            opacity: [0, 1, 0], scale: [0.8, 1.2, 0],
          }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.25 }}
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

      {/* Badge with flame overlay */}
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(255,100,0,0.4) 0%, transparent 50%, rgba(255,200,100,0.3) 100%)" }}
          animate={{ opacity: [0.3, 0.7, 0.4, 0.8, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1.05, 1.12, 1], rotate: [0, -3, 3, -2, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <Medal className="w-5 h-5 text-white drop-shadow-[0_0_6px_rgba(255,120,50,0.9)]" strokeWidth={2.5} />
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

/* ─── Main Component ─── */
interface TopRankingPodiumProps {
  userId: string;
  onViewFull?: () => void;
}

export function TopRankingPodium({ userId, onViewFull }: TopRankingPodiumProps) {
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_recargas_ranking" as any, { _limit: 10 });
    if (data) setRanking(data as RankUser[]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/60 animate-pulse" />
            <div className="flex-1 h-3 bg-muted/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (ranking.length < 3) return null;

  const topUsers = ranking.slice(0, 3);
  const restUsers = ranking.slice(3);
  const maxRecargas = Math.max(...ranking.map(r => r.total_recargas), 1);
  const userRank = ranking.findIndex(r => r.user_id === userId);

  // Podium order: [2nd, 1st, 3rd]
  const podiumOrder = [topUsers[1], topUsers[0], topUsers[2]];

  const getPodiumConfig = (displayIndex: number) => {
    switch (displayIndex) {
      case 0: return { position: 2, avatarSize: "w-20 h-20", ringColor: "ring-gray-300/60", badge: <SilverIceBadge size={32} /> };
      case 1: return { position: 1, avatarSize: "w-28 h-28", ringColor: "ring-yellow-500/70", badge: <GoldFloatingCrown size={36} /> };
      case 2: return { position: 3, avatarSize: "w-20 h-20", ringColor: "ring-orange-600/60", badge: <BronzeFireBadge size={32} /> };
      default: return { position: 0, avatarSize: "w-20 h-20", ringColor: "ring-muted", badge: null };
    }
  };

  const rowStyles = [
    "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-500",
    "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400",
    "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-l-amber-600",
  ];

  return (
    <div className="glass-card rounded-xl p-4 space-y-4 overflow-visible">
      {/* Title bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
          <h2 className="relative text-lg md:text-xl font-bold overflow-hidden">
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
              className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Ranking
              <span className="relative ml-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Podium: [2nd, 1st, 3rd] */}
      <div className="flex items-end justify-center gap-3 md:gap-6 py-2">
        {podiumOrder.map((user, displayIndex) => {
          const config = getPodiumConfig(displayIndex);
          const isCenter = displayIndex === 1;
          return (
            <motion.div
              key={user.user_id}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: displayIndex * 0.15, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.08 }}
            >
              {/* Badge icon */}
              <div className="mb-1">{config.badge}</div>

              {/* Avatar */}
              <div className={`relative ${config.avatarSize} rounded-full ring-2 ${config.ringColor} overflow-visible`}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nome}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-lg">
                    {(user.nome?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <AvatarFlash index={config.position - 1} />
                {user.verification_badge && (
                  <div className="absolute -bottom-1 -right-1">
                    <VerificationBadge badge={user.verification_badge as BadgeType} size="sm" />
                  </div>
                )}
              </div>

              {/* Name + count */}
              <p className={`text-center font-semibold truncate max-w-[120px] md:max-w-[140px] ${isCenter ? "text-sm text-foreground" : "text-xs text-muted-foreground"}`} title={user.nome}>
                {user.nome}
              </p>
              <span className={`text-xs ${isCenter ? "text-yellow-500 font-bold" : "text-muted-foreground"}`}>
                <span className={`font-mono font-bold tabular-nums ${isCenter ? "text-lg" : "text-sm"}`}>{user.total_recargas}</span>
                {" "}compras
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* User position bar */}
      {userRank >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center pt-2"
        >
          <div className="flex items-center gap-3 bg-secondary/80 backdrop-blur-sm rounded-full px-5 py-2.5 border border-border shadow-lg">
            <span className="text-sm text-muted-foreground">Sua posição:</span>
            <span className="bg-destructive text-destructive-foreground font-bold text-sm min-w-[32px] text-center px-2.5 py-1 rounded-full">
              {userRank + 1}º
            </span>
            {ranking[userRank]?.avatar_url ? (
              <img src={ranking[userRank].avatar_url!} alt="" className="h-9 w-9 rounded-full ring-2 ring-border object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full ring-2 ring-border bg-muted flex items-center justify-center text-foreground font-bold text-xs">
                {(ranking[userRank]?.nome?.[0] || "?").toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{ranking[userRank]?.nome}</span>
              <span className="text-[10px] text-muted-foreground">{ranking[userRank]?.total_recargas} compras</span>
            </div>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">Você</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
