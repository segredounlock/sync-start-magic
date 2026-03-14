import { useRef, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Gift, Sparkles, Calendar, Trophy, History } from "lucide-react";
import { Currency } from "@/components/ui/Currency";
import confetti from "canvas-confetti";

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

export function ScratchCard({ userId }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scratching, setScratchting] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<{ prize_amount: number; is_won: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryCard[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const isDrawing = useRef(false);
  const cardSize = { w: 280, h: 200 };

  // Check for existing card today
  useEffect(() => {
    checkTodayCard();
    loadHistory();
  }, [userId]);

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
      setCard({ id: d.id, card_date: d.card_date, is_scratched: d.is_scratched });
      if (d.is_scratched) {
        setRevealed(true);
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

  const claimCard = async () => {
    setLoading(true);
    try {
      console.log("[ScratchCard] Claiming card...");
      const { data, error } = await supabase.functions.invoke("scratch-card", {
        body: { action: "claim" },
      });
      console.log("[ScratchCard] Claim response:", { data, error });
      if (error) {
        console.error("[ScratchCard] Claim error:", error);
        throw error;
      }
      if (data?.error === "already_claimed" && data?.card) {
        setCard(data.card);
        if (data.card.is_scratched) {
          setRevealed(true);
          setResult({ prize_amount: data.card.prize_amount, is_won: data.card.is_won });
        } else {
          setTimeout(() => initCanvas(), 150);
        }
        return;
      }
      if (data?.error) {
        console.error("[ScratchCard] Server error:", data.error, data.message);
        return;
      }
      if (data?.card) {
        setCard(data.card);
        setTimeout(() => initCanvas(), 150);
      }
    } catch (e) {
      console.error("[ScratchCard] Claim exception:", e);
    } finally {
      setLoading(false);
    }
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = cardSize.w * 2;
    canvas.height = cardSize.h * 2;
    ctx.scale(2, 2);

    // Draw scratch overlay
    const grad = ctx.createLinearGradient(0, 0, cardSize.w, cardSize.h);
    grad.addColorStop(0, "#c0c0c0");
    grad.addColorStop(0.5, "#d4d4d4");
    grad.addColorStop(1, "#a8a8a8");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, cardSize.w, cardSize.h, 16);
    ctx.fill();

    // Add pattern
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * cardSize.w;
      const y = Math.random() * cardSize.h;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("🎰 RASPE AQUI 🎰", cardSize.w / 2, cardSize.h / 2 - 10);
    ctx.font = "13px system-ui";
    ctx.fillText("Arraste para revelar", cardSize.w / 2, cardSize.h / 2 + 15);
  }, []);

  useEffect(() => {
    if (card && !card.is_scratched && !revealed) {
      setTimeout(() => initCanvas(), 150);
    }
  }, [card, revealed, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX / 2,
        y: (e.touches[0].clientY - rect.top) * scaleY / 2,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX / 2,
      y: (e.clientY - rect.top) * scaleY / 2,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x * 2, y * 2, 40, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    const pct = (cleared / (imageData.data.length / 4)) * 100;
    setScratchPercent(pct);

    if (pct > 55 && !revealed) {
      revealCard();
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (revealed) return;
    isDrawing.current = true;
    setScratchting(true);
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || revealed) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
    setScratchting(false);
  };

  const revealCard = async () => {
    setRevealed(true);
    try {
      const { data, error } = await supabase.functions.invoke("scratch-card", {
        body: { action: "scratch" },
      });
      if (error) throw error;
      setResult(data);
      if (data?.is_won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#f59e0b", "#8b5cf6"],
        });
      }
      loadHistory();
    } catch (e) {
      console.error("Scratch error:", e);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  // No card claimed yet
  if (!card) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Raspadinha Diária</h2>
        </div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-8 text-center space-y-5 max-w-sm mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Gift className="h-16 w-16 text-primary mx-auto" />
          </motion.div>
          <h3 className="text-lg font-bold text-foreground">Sua raspadinha de hoje</h3>
          <p className="text-sm text-muted-foreground">
            Ganhe uma raspadinha grátis todo dia! Raspe e descubra se ganhou saldo.
          </p>
          <motion.button
            onClick={claimCard}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {loading ? "Gerando..." : "🎰 Resgatar Raspadinha"}
          </motion.button>
        </motion.div>

        {history.length > 0 && (
          <HistorySection history={history} showHistory={showHistory} setShowHistory={setShowHistory} formatDate={formatDate} />
        )}
      </div>
    );
  }

  // Card already scratched
  if (revealed && result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Raspadinha Diária</h2>
        </div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-8 text-center space-y-4 max-w-sm mx-auto overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {result.is_won ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Trophy className="h-16 w-16 text-warning mx-auto" />
              </motion.div>
              <motion.h3
                className="text-xl font-extrabold text-success"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎉 Você ganhou!
              </motion.h3>
              <motion.div
                className="text-3xl font-black text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Currency value={result.prize_amount} />
              </motion.div>
              <p className="text-sm text-muted-foreground">Crédito adicionado ao seu saldo!</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Ticket className="h-16 w-16 text-muted-foreground/40 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-bold text-muted-foreground">Não foi desta vez!</h3>
              <p className="text-sm text-muted-foreground">Tente novamente amanhã 🍀</p>
            </>
          )}

          <div className="pt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Volte amanhã para uma nova raspadinha!</span>
          </div>
        </motion.div>

        {history.length > 0 && (
          <HistorySection history={history} showHistory={showHistory} setShowHistory={setShowHistory} formatDate={formatDate} />
        )}
      </div>
    );
  }

  // Card ready to scratch
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Ticket className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Raspadinha Diária</h2>
      </div>

      <div className="max-w-sm mx-auto space-y-4">
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-border p-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Prize layer underneath */}
          <div
            className="absolute inset-4 rounded-xl bg-card flex flex-col items-center justify-center gap-2 z-0"
            style={{ width: cardSize.w, height: cardSize.h }}
          >
            <Sparkles className="h-10 w-10 text-warning animate-pulse" />
            <span className="text-sm font-bold text-muted-foreground">Raspando...</span>
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(scratchPercent / 55 * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Canvas scratch layer */}
          <canvas
            ref={canvasRef}
            className="relative z-10 rounded-xl cursor-pointer touch-none"
            style={{ width: cardSize.w, height: cardSize.h }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          {scratching ? "Continue raspando..." : "Arraste o dedo ou mouse para raspar!"}
        </p>
      </div>

      {history.length > 0 && (
        <HistorySection history={history} showHistory={showHistory} setShowHistory={setShowHistory} formatDate={formatDate} />
      )}
    </div>
  );
}

function HistorySection({ history, showHistory, setShowHistory, formatDate }: {
  history: HistoryCard[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  formatDate: (d: string) => string;
}) {
  const totalWon = history.filter(h => h.is_won).reduce((sum, h) => sum + h.prize_amount, 0);
  const winRate = history.length > 0 ? Math.round((history.filter(h => h.is_won).length / history.length) * 100) : 0;

  return (
    <div className="max-w-sm mx-auto">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Histórico ({history.length})
        </span>
        <span className="text-xs text-muted-foreground">
          Ganhos: <Currency value={totalWon} /> • {winRate}% de acerto
        </span>
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="mt-2 space-y-1.5 max-h-60 overflow-y-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-sm"
              >
                <span className="text-muted-foreground">{formatDate(h.card_date)}</span>
                {h.is_won ? (
                  <span className="font-bold text-success">+<Currency value={h.prize_amount} /></span>
                ) : (
                  <span className="text-muted-foreground/50">Sem prêmio</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
