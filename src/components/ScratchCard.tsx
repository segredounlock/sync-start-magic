import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, Gift, Sparkles, Calendar, Trophy, History, Crown, Star, Medal,
  Frown, Info, Wallet, Clock
} from "lucide-react";
import { Currency } from "@/components/ui/Currency";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import confetti from "canvas-confetti";
import { ScratchCanvas } from "@/components/ScratchCanvas";

interface ScratchCardProps {
  userId: string;
}

interface CardData {
  id: string;
  card_date: string;
  is_scratched: boolean;
  prize_amount?: number;
  is_won?: boolean;
}

interface HistoryCard {
  id: string;
  card_date: string;
  prize_amount: number;
  is_won: boolean;
  is_scratched: boolean;
  scratched_at: string | null;
  created_at: string;
}

interface WinnerEntry {
  nome: string;
  avatar_url: string | null;
  verification_badge: string | null;
  prize_amount: number;
  card_date: string;
}

// Simple seeded random from card ID
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}

const POSSIBLE_VALUES = [0.10, 0.25, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00];

function generateGrid(cardId: string, isWon: boolean, prizeAmount: number): number[] {
  const rng = seededRandom(cardId);
  const grid: number[] = new Array(9);

  if (isWon && prizeAmount > 0) {
    // Place 3 winning cells
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const winPositions: number[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(rng() * positions.length);
      winPositions.push(positions.splice(idx, 1)[0]);
    }
    // Fill winning positions
    for (const p of winPositions) grid[p] = prizeAmount;
    // Fill rest with non-matching values
    const others = POSSIBLE_VALUES.filter(v => v !== prizeAmount);
    for (const p of positions) {
      grid[p] = others[Math.floor(rng() * others.length)];
    }
  } else {
    // No 3 should match - pick values ensuring max 2 of same
    const counts: Record<number, number> = {};
    for (let i = 0; i < 9; i++) {
      let val: number;
      let attempts = 0;
      do {
        val = POSSIBLE_VALUES[Math.floor(rng() * POSSIBLE_VALUES.length)];
        attempts++;
      } while ((counts[val] || 0) >= 2 && attempts < 50);
      grid[i] = val;
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return grid;
}

const RANK_ICONS = [Crown, Star, Medal];
const RANK_COLORS = [
  "bg-yellow-100 text-yellow-600",
  "bg-gray-100 text-gray-500",
  "bg-orange-100 text-orange-500",
];

type ClaimResponse = { error?: string; message?: string; card?: CardData };
type ScratchResponse = { error?: string; message?: string; prize_amount?: number; is_won?: boolean };

function parsePayload<T>(payload: unknown): T | null {
  if (!payload) return null;
  if (typeof payload === "string") {
    try { return JSON.parse(payload) as T; } catch { return null; }
  }
  return payload as T;
}

export function ScratchCard({ userId }: ScratchCardProps) {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<{ prize_amount: number; is_won: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryCard[]>([]);
  const [topWinners, setTopWinners] = useState<WinnerEntry[]>([]);
  const [recentWinners, setRecentWinners] = useState<WinnerEntry[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"diaria" | "dourada">("diaria");
  const [spendingBlock, setSpendingBlock] = useState<{ totalSpent: number; minRequired: number } | null>(null);

  const grid = useMemo(() => {
    if (!card) return [];
    return generateGrid(card.id, Boolean(card.is_won), card.prize_amount ?? 0);
  }, [card]);

  useEffect(() => {
    checkTodayCard();
    loadHistory();
    loadLeaderboards();
    loadBalance();
  }, [userId]);

  const loadBalance = async () => {
    const { data } = await supabase
      .from("saldos")
      .select("valor")
      .eq("user_id", userId)
      .eq("tipo", "revenda")
      .maybeSingle();
    if (data) setBalance(Number((data as any).valor));
  };

  const checkTodayCard = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("scratch_cards" as any)
      .select("*")
      .eq("user_id", userId)
      .eq("card_date", today)
      .maybeSingle();
    if (data) {
      const d = data as any;
      const cardData: CardData = {
        id: d.id, card_date: d.card_date, is_scratched: d.is_scratched,
        prize_amount: d.prize_amount, is_won: d.is_won,
      };
      setCard(cardData);
      if (d.is_scratched) {
        setGameOver(true);
        setRevealedCells(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
        setResult({ prize_amount: d.prize_amount, is_won: d.is_won });
      }
    }
  };

  const loadHistory = async () => {
    const { data } = await supabase
      .from("scratch_cards" as any)
      .select("*")
      .eq("user_id", userId)
      .eq("is_scratched", true)
      .order("card_date", { ascending: false })
      .limit(30);
    if (data) setHistory(data as any);
  };

  const loadLeaderboards = async () => {
    const [top, recent] = await Promise.all([
      supabase.rpc("get_scratch_top_winners" as any),
      supabase.rpc("get_scratch_recent_winners" as any),
    ]);
    if (top.data) setTopWinners(top.data as any);
    if (recent.data) setRecentWinners(recent.data as any);
  };

  const claimCard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scratch-card", {
        body: { action: "claim" },
      });
      const payload = parsePayload<ClaimResponse & { total_spent?: number; min_required?: number }>(data);
      if (error) throw error;
      if (!payload) return;

      if (payload.error === "insufficient_spending") {
        setSpendingBlock({
          totalSpent: payload.total_spent ?? 0,
          minRequired: payload.min_required ?? 50,
        });
        return;
      }

      if (payload.error === "already_claimed" && payload.card) {
        const c = payload.card;
        setCard(c);
        if (c.is_scratched) {
          setGameOver(true);
          setRevealedCells(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
          setResult({ prize_amount: c.prize_amount ?? 0, is_won: Boolean(c.is_won) });
        }
        return;
      }
      if (payload.card) setCard(payload.card);
    } catch (e) {
      console.error("[ScratchCard] Claim error:", e);
    } finally {
      setLoading(false);
    }
  };

  const finishGame = async () => {
    if (!card) return;

    setGameOver(true);
    setRevealedCells(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));

    const recoverFromNoCard = async () => {
      setGameOver(false);
      setRevealedCells(new Set());
      setResult(null);
      setCard(null);
      await checkTodayCard();
    };

    try {
      const { data, error } = await supabase.functions.invoke("scratch-card", {
        body: { action: "scratch", card_id: card.id },
      });

      if (error) {
        const contextPayload = parsePayload<ScratchResponse>((error as any)?.context?.json);
        if (contextPayload?.error === "no_card") {
          await recoverFromNoCard();
          return;
        }
        throw error;
      }

      const payload = parsePayload<ScratchResponse>(data);
      if (!payload || payload.error) {
        if (payload?.error === "no_card") {
          await recoverFromNoCard();
          return;
        }
        throw new Error(payload?.message || "Erro");
      }

      const r = { prize_amount: Number(payload.prize_amount ?? 0), is_won: Boolean(payload.is_won) };
      setResult(r);
      if (r.is_won) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#10b981", "#f59e0b", "#8b5cf6"] });
      }
      loadHistory();
      loadBalance();
      loadLeaderboards();
    } catch (e) {
      console.error("Scratch error:", e);
      setGameOver(false);
    }
  };

  const handleScratchComplete = () => {
    if (gameOver) return;
    void finishGame();
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-foreground">Raspadinha</h1>
        <p className="text-sm text-muted-foreground">Tente a sorte e ganhe saldo na sua carteira!</p>
      </div>

      {/* Tabs */}
      <div className="flex max-w-md mx-auto rounded-full border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab("diaria")}
          className={`flex-1 py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === "diaria"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Ticket className="h-4 w-4" /> Diária
        </button>
        <button
          onClick={() => setActiveTab("dourada")}
          className={`flex-1 py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === "dourada"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Star className="h-4 w-4" /> Dourada
        </button>
      </div>

      {activeTab === "dourada" ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md mx-auto">
          <Star className="h-12 w-12 text-warning mx-auto mb-3" />
          <h3 className="font-bold text-foreground">Em breve!</h3>
          <p className="text-sm text-muted-foreground mt-1">A raspadinha dourada está chegando.</p>
        </div>
      ) : (
        <>
          {/* Main layout */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: Game area */}
            <div className="flex-1">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" /> Sua chance
                </h3>

                {spendingBlock ? (
                  /* Spending requirement not met */
                  <motion.div
                    className="text-center space-y-4 py-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Wallet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Raspadinha Bloqueada</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Faça pelo menos <span className="font-bold text-primary">R$ {spendingBlock.minRequired.toFixed(2)}</span> em recargas para desbloquear.
                      </p>
                    </div>
                    <div className="max-w-xs mx-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span className="font-bold text-foreground">
                          R$ {spendingBlock.totalSpent.toFixed(2)} / R$ {spendingBlock.minRequired.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (spendingBlock.totalSpent / spendingBlock.minRequired) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Faltam <span className="font-bold text-primary">R$ {Math.max(0, spendingBlock.minRequired - spendingBlock.totalSpent).toFixed(2)}</span> em recargas
                      </p>
                    </div>
                  </motion.div>
                ) : !card ? (
                  /* Claim state */
                  <motion.div
                    className="text-center space-y-5 py-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Gift className="h-16 w-16 text-primary mx-auto" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Sua raspadinha de hoje</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ganhe uma raspadinha grátis todo dia! Revele as células e descubra se ganhou.
                      </p>
                    </div>
                    <motion.button
                      onClick={claimCard}
                      disabled={loading}
                      className="w-full max-w-xs mx-auto py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {loading ? "Gerando..." : "🎰 Resgatar Raspadinha"}
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Grid */
                  <div className="relative">
                    <ScratchCanvas
                      key={card.id}
                      grid={grid}
                      onScratchComplete={handleScratchComplete}
                      disabled={gameOver}
                    />

                    {/* Game Over Overlay */}
                    <AnimatePresence>
                      {gameOver && result && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-border max-w-[80%]"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                          >
                            {result.is_won ? (
                              <>
                                <Trophy className="h-12 w-12 text-warning mx-auto mb-2" />
                                <h3 className="text-lg font-extrabold text-success">🎉 Parabéns!</h3>
                                <p className="text-2xl font-black text-primary mt-1">
                                  + R$ {result.prize_amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">Crédito adicionado!</p>
                              </>
                            ) : (
                              <>
                                <Frown className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-foreground">Não foi dessa vez</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Tente novamente amanhã ou jogue a Gold!
                                </p>
                              </>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="mt-4 bg-card border border-border rounded-2xl p-4">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" /> Regras Diárias:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Jogue grátis</strong> uma vez por dia!</li>
                  <li>Encontre <strong>3 valores iguais</strong> para ganhar.</li>
                </ul>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:w-80 space-y-4">
              {/* Balance */}
              <div className="bg-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-20">
                  <Wallet className="h-12 w-12" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Seu Saldo Atual</p>
                <p className="text-3xl font-black mt-1">R$ {balance.toFixed(2)}</p>
                <p className="text-xs mt-2 opacity-70">Prêmios da raspadinha são somados aqui.</p>
              </div>

              {/* History */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Seu Histórico
                </h4>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum jogo ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${h.is_won ? "bg-success" : "bg-muted-foreground/30"}`} />
                          <div>
                            <p className="font-medium text-foreground">{formatDate(h.card_date)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(h.scratched_at)} • Diária</p>
                          </div>
                        </div>
                        {h.is_won ? (
                          <span className="font-bold text-success text-xs">+ R$ {h.prize_amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded">PERDEU</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboards */}
          {(topWinners.length > 0 || recentWinners.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hall da Fama */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                  <AnimatedIcon icon={Trophy} className="h-5 w-5 text-warning" animation="wiggle" /> Hall da Fama
                </h4>
                <div className="space-y-3">
                  {topWinners.map((w, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {w.avatar_url ? (
                            <img src={w.avatar_url} alt={w.nome} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              i < 3 ? RANK_COLORS[i] : "bg-muted text-muted-foreground"
                            }`}>
                              {w.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <p className={`font-medium text-foreground text-sm ${w.verification_badge ? "shimmer-letters" : ""}`}>
                                {w.nome}
                              </p>
                              <VerificationBadge badge={w.verification_badge as BadgeType} size="xs" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(w.card_date)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-success text-sm">+ R$ {w.prize_amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Últimos Prêmios */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                  <AnimatedIcon icon={Sparkles} className="h-5 w-5 text-purple-500" animation="pulse" /> Últimos Prêmios
                </h4>
                <div className="space-y-3">
                  {recentWinners.map((w, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {w.avatar_url ? (
                            <img src={w.avatar_url} alt={w.nome} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              i < 3 ? RANK_COLORS[i] : "bg-muted text-muted-foreground"
                            }`}>
                              {w.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <p className={`font-medium text-foreground text-sm ${w.verification_badge ? "shimmer-letters" : ""}`}>
                                {w.nome}
                              </p>
                              <VerificationBadge badge={w.verification_badge as BadgeType} size="xs" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(w.card_date)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-success text-sm">+ R$ {w.prize_amount.toFixed(2)}</span>
                      </div>
                    ))}
                  {recentWinners.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum ganhador ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}