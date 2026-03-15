import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";


interface RankUser {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  verification_badge: string | null;
  total_recargas: number;
}

/* ─── Gold Crown (smaller for list) ─── */
function GoldCrownSmall({ size = 22 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style", willChange: "transform" }}
      animate={{ y: [0, -2, 0], rotate: [0, -2, 2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* 4 orbiting particles (90°) */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: "50%", left: "50%", overflow: "visible" }}
          animate={{
            x: [0, Math.cos((i * 90 * Math.PI) / 180) * 14],
            y: [0, Math.sin((i * 90 * Math.PI) / 180) * 14],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35 }}
        >
          <div className="w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_2px_1px_rgba(253,224,71,0.4)]" />
        </motion.div>
      ))}

      <motion.div
        className="absolute inset-[-4px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 65%)" }}
        animate={{ scale: [1.1, 1.3, 1.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative" style={{ width: size * 0.75, height: size * 0.75 }}>
        <Crown fill="currentColor" className="text-yellow-400 absolute inset-0 w-full h-full" strokeWidth={0} />
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="crownGradientRanking" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <motion.path
            d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
            fill="none"
            stroke="url(#crownGradientRanking)"
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

/* ─── Silver Badge (smaller) ─── */
function SilverBadgeSmall({ size = 22 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style" }}
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <motion.div
        className="absolute inset-[-3px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(200,220,255,0.3) 0%, transparent 70%)", filter: "blur(2px)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-gray-300 to-slate-400 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        />
        <Medal className="w-3.5 h-3.5 text-white drop-shadow-[0_0_3px_rgba(200,220,255,0.8)]" strokeWidth={2.5} />
      </div>
    </motion.div>
  );
}

/* ─── Bronze Badge (smaller) ─── */
function BronzeBadgeSmall({ size = 22 }: { size?: number }) {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, contain: "layout style", overflow: "visible" }}
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        className="absolute inset-[-3px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,120,50,0.4) 0%, transparent 65%)", filter: "blur(3px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(255,100,0,0.4) 0%, transparent 50%, rgba(255,200,100,0.3) 100%)" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <Medal className="w-3.5 h-3.5 text-white drop-shadow-[0_0_4px_rgba(255,120,50,0.9)]" strokeWidth={2.5} />
      </div>
    </motion.div>
  );
}

/* ─── Flash for top 3 in list ─── */
function ListFlash({ index }: { index: number }) {
  const bgColor = index === 0 ? "rgba(255,225,50,1)" : index === 1 ? "rgba(230,230,240,1)" : "rgba(225,160,70,1)";
  const shadowColor = index === 0 ? "rgba(255,215,0,0.5)" : index === 1 ? "rgba(220,220,230,0.5)" : "rgba(215,145,60,0.5)";
  const gradColor = index === 0
    ? "linear-gradient(transparent, rgba(255,215,0,0.9), transparent)"
    : index === 1
    ? "linear-gradient(transparent, rgba(220,220,230,0.9), transparent)"
    : "linear-gradient(transparent, rgba(215,145,60,0.9), transparent)";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: -3, right: -3, width: 8, height: 8 }}
      animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay: index * 0.7 }}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-full rounded-full" style={{ background: gradColor }} />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[1px] w-full rounded-full" style={{ background: gradColor }} />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
        style={{ background: bgColor, boxShadow: `0 0 4px 1px ${shadowColor}` }}
      />
    </motion.div>
  );
}

/* ─── Skeleton ─── */
function RankingItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-11 h-11 rounded-full bg-muted/60 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-24 bg-muted/60 rounded animate-pulse" />
        <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
      </div>
      <div className="h-5 w-12 bg-muted/60 rounded animate-pulse" />
    </div>
  );
}

/* ─── Main ─── */
interface ClientRankingProps {
  userId: string;
  onBack?: () => void;
}

export function ClientRanking({ userId, onBack }: ClientRankingProps) {
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_recargas_ranking" as any, { _limit: 20 });
    if (data) setRanking(data as RankUser[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
    const channel = supabase
      .channel("ranking-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchRanking()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const myPosition = ranking.findIndex(r => r.user_id === userId);

  const rowStyles = [
    "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-500",
    "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400",
    "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-l-amber-600",
  ];

  const getBadge = (index: number) => {
    if (index === 0) return <GoldCrownSmall size={22} />;
    if (index === 1) return <SilverBadgeSmall size={22} />;
    if (index === 2) return <BronzeBadgeSmall size={22} />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Trophy with ghost glow */}
        <motion.div
          animate={{ y: [0, -3, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          className="relative"
        >
          <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-8 h-8 text-yellow-300 blur-[2px]" />
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
          Ranking Completo
        </h1>

        {/* User position badge */}
        {myPosition >= 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Sua posição: <strong className="text-primary">#{myPosition + 1}</strong>
            </span>
          </motion.div>
        )}
      </div>

      {/* Ranking Card */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="w-5 h-5 text-primary" />
            Top 20 Compradores
          </h3>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(8)].map((_, i) => <RankingItemSkeleton key={i} />)}
            </div>
          ) : (
            <motion.div
              className="divide-y divide-border"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
            >
              {ranking.map((user, index) => {
                const isTopThree = index < 3;
                const isMe = user.user_id === userId;
                const badge = getBadge(index);

                return (
                  <motion.div
                    key={user.user_id}
                    variants={{
                      hidden: { opacity: 0, x: -16 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isTopThree ? rowStyles[index] : ""
                    } ${isMe && !isTopThree ? "bg-primary/5 border-l-2 border-l-primary" : ""} ${
                      isMe && isTopThree ? "ring-1 ring-inset ring-primary/40" : ""
                    }`}
                  >
                    {/* Avatar with badge */}
                    <div className={`relative ${isTopThree ? "h-14 w-14" : "h-11 w-11"} shrink-0`}>
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.nome}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-foreground font-bold">
                          {(user.nome?.[0] || "?").toUpperCase()}
                        </div>
                      )}

                      {isTopThree && badge && (
                        <div className="absolute" style={{ top: -4, left: -4 }}>
                          {badge}
                        </div>
                      )}

                      {!isTopThree && (
                        <span className="absolute -top-1.5 -left-1.5 flex items-center justify-center rounded-full text-[10px] font-bold leading-none h-4 w-4 bg-secondary text-muted-foreground border border-border">
                          {index + 1}
                        </span>
                      )}

                      {isTopThree && <ListFlash index={index} />}

                      {user.verification_badge && (
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <VerificationBadge badge={user.verification_badge as BadgeType} size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Name + label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`font-semibold truncate ${isTopThree ? "text-sm" : "text-sm text-muted-foreground"}`}>
                          {user.nome}
                        </p>
                        {isMe && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                            Você
                          </span>
                        )}
                      </div>
                      {isTopThree && (
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? "Campeão" : index === 1 ? "Vice" : "3º Lugar"}
                        </p>
                      )}
                    </div>

                    {/* Purchase count */}
                    <div className="flex flex-col items-end shrink-0">
                      <p className={`font-bold text-primary ${isTopThree ? "text-xl" : "text-lg"}`}>
                        {user.total_recargas}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        recargas
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
