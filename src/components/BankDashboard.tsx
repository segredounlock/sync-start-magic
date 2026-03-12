import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter, AnimatedInt } from "./AnimatedCounter";
import { AnimatedIcon } from "./AnimatedIcon";
import { SkeletonValue } from "./Skeleton";
import {
  Eye, EyeOff, Send, CreditCard, History, Landmark,
  TrendingUp, TrendingDown, Smartphone, ArrowUpRight, ArrowDownLeft,
  Wallet, ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Recarga, Transaction } from "@/types";
import { formatDateTimeBR, toLocalDateKey, getTodayLocalKey } from "@/lib/timezone";
import { operadoraColors, safeValor } from "@/lib/utils";

interface BankDashboardProps {
  saldo: number;
  recargas: Recarga[];
  transactions: Transaction[];
  loading: boolean;
  onNavigate: (tab: string) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function BankDashboard({
  saldo,
  recargas,
  transactions,
  loading,
  onNavigate,
}: BankDashboardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const todayKey = getTodayLocalKey();

  const stats = useMemo(() => {
    const recHoje = recargas.filter((r) => toLocalDateKey(r.created_at) === todayKey);
    const totalGasto = recargas.reduce((s, r) => s + (Number(safeValor(r)) || 0), 0);
    const totalDepositos = transactions
      .filter((t) => t.status === "approved")
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const ticketMedio = recargas.length > 0 ? totalGasto / recargas.length : 0;

    return { recHoje: recHoje.length, totalGasto, totalDepositos, ticketMedio };
  }, [recargas, transactions, todayKey]);

  const recentRecargas = useMemo(
    () => recargas.slice(0, 5),
    [recargas]
  );

  const quickActions = [
    { key: "recarga", label: "Recarga", icon: Send, color: "text-primary", bg: "bg-primary/10" },
    { key: "addSaldo", label: "Depositar", icon: CreditCard, color: "text-success", bg: "bg-success/10" },
    { key: "historico", label: "Histórico", icon: History, color: "text-accent", bg: "bg-accent/10" },
    { key: "extrato", label: "Extrato", icon: Landmark, color: "text-warning", bg: "bg-warning/10" },
  ];

  const statusColor = (s: string) => {
    if (s === "completed") return "text-success";
    if (s === "pending") return "text-warning";
    return "text-destructive";
  };

  const statusLabel = (s: string) => {
    if (s === "completed") return "Concluída";
    if (s === "pending") return "Pendente";
    return "Falha";
  };

  return (
    <div className="space-y-4">
      {/* ── Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-5"
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Seu Lucro
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <AnimatePresence mode="wait">
              {showBalance ? (
                <motion.p
                  key="visible"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                >
                  {loading ? (
                    <SkeletonValue width="w-36" className="h-9" />
                  ) : (
                    <AnimatedCounter value={saldo} prefix="R$&nbsp;" />
                  )}
                </motion.p>
              ) : (
                <motion.p
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                >
                  R$&nbsp;••••••
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Deposit button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("addSaldo")}
            className="absolute right-5 bottom-5 w-11 h-11 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--success)/0.4)] hover:shadow-[0_0_28px_hsl(var(--success)/0.6)] transition-shadow"
          >
            <CreditCard className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Rainbow gradient bar */}
        <div className="rainbow-bar mt-4 h-1 rounded-full" />
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onNavigate(action.key)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
          >
            <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-[11px] font-semibold text-foreground leading-tight text-center">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Stats Grid (2x2) ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Recargas Hoje",
            value: stats.recHoje,
            isCurrency: false,
            icon: Smartphone,
            color: "text-primary",
            bg: "bg-primary/10",
            trend: null,
          },
          {
            label: "Ticket Médio",
            value: stats.ticketMedio,
            isCurrency: true,
            icon: Wallet,
            color: "text-accent",
            bg: "bg-accent/10",
            trend: null,
          },
          {
            label: "Total Depósitos",
            value: stats.totalDepositos,
            isCurrency: true,
            icon: ArrowDownLeft,
            color: "text-success",
            bg: "bg-success/10",
            trend: "up" as const,
          },
          {
            label: "Total Vendas",
            value: stats.totalGasto,
            isCurrency: true,
            icon: ArrowUpRight,
            color: "text-warning",
            bg: "bg-warning/10",
            trend: "down" as const,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 180 }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${card.color} truncate`}>
              {loading ? (
                <SkeletonValue width="w-20" className="h-7" />
              ) : card.isCurrency ? (
                showBalance ? (
                  <AnimatedCounter value={card.value} prefix="R$&nbsp;" />
                ) : (
                  "R$&nbsp;••••"
                )
              ) : (
                <AnimatedInt value={card.value} />
              )}
            </p>
            {card.trend && (
              <div className="flex items-center gap-1 mt-1.5">
                {card.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-warning" />
                )}
                <span className={`text-[10px] font-medium ${card.trend === "up" ? "text-success" : "text-warning"}`}>
                  {card.trend === "up" ? "Entradas" : "Saídas"}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Recent Transactions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 160 }}
        className="rounded-2xl bg-card border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-bold text-foreground">Últimas Recargas</h3>
          <button
            onClick={() => onNavigate("historico")}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            ver mais <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {recentRecargas.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-muted-foreground text-center py-6">
            Nenhuma recarga realizada ainda
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRecargas.map((rec, i) => {
              const opName = rec.operadora || "Operadora";
              const opColors = operadoraColors(opName);
              const opColor = opColors.bg;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${opColor} flex items-center justify-center shrink-0`}>
                    <Smartphone className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {rec.telefone}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {opName} · {formatDateTimeBR(rec.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {showBalance ? fmt(Number(safeValor(rec)) || 0) : "••••"}
                    </p>
                    <p className={`text-[10px] font-medium ${statusColor(rec.status)}`}>
                      {statusLabel(rec.status)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
