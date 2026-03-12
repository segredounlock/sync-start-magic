import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter, AnimatedInt } from "./AnimatedCounter";
import { AnimatedIcon } from "./AnimatedIcon";
import { SkeletonValue } from "./Skeleton";
import {
  Eye, EyeOff, Plus, CreditCard, History, Users,
  TrendingUp, TrendingDown, Smartphone, ArrowUpRight, ArrowDownLeft,
  Wallet, ChevronRight, DollarSign, Landmark, Package,
} from "lucide-react";
import { useState } from "react";

interface AdminBankDashboardProps {
  lucro: number;
  totalDeposited: number;
  saldoCarteiras: number;
  ticketMedio: number;
  totalRec: number;
  successRec: number;
  pendingRec: number;
  meuSaldo: number;
  loading: boolean;
  onAddSaldo: () => void;
  onNavigate: (tab: string) => void;
  onShowLucroModal?: () => void;
  lucroPct: number;
  txCount: number;
  totalCobrado: number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminBankDashboard({
  lucro,
  totalDeposited,
  saldoCarteiras,
  ticketMedio,
  totalRec,
  successRec,
  pendingRec,
  meuSaldo,
  loading,
  onAddSaldo,
  onNavigate,
  onShowLucroModal,
  lucroPct,
  txCount,
  totalCobrado,
}: AdminBankDashboardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const quickActions = [
    { key: "addSaldo", label: "Depositar", icon: CreditCard, color: "text-success", bg: "bg-success/10" },
    { key: "historico", label: "Recargas", icon: Smartphone, color: "text-primary", bg: "bg-primary/10" },
    { key: "usuarios", label: "Usuários", icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { key: "depositos", label: "Depósitos", icon: Landmark, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Balance Card (Seu Lucro) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 cursor-pointer"
        onClick={onShowLucroModal}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-success/8 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Seu Lucro
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
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
                  className={`text-3xl sm:text-4xl font-bold tracking-tight ${lucro >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {loading ? (
                    <SkeletonValue width="w-36" className="h-9" />
                  ) : (
                    <AnimatedCounter value={lucro} prefix="R$&nbsp;" />
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

          {/* Lucro percentage badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lucro >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {lucro >= 0 ? "↑" : "↓"} {lucroPct.toFixed(1)}% margem
            </span>
            <span className="text-[10px] text-muted-foreground">
              sobre {showBalance ? fmt(totalCobrado) : "••••"} cobrado
            </span>
          </div>

          {/* Deposit button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onAddSaldo(); }}
            className="absolute right-5 top-5 w-11 h-11 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--success)/0.4)] hover:shadow-[0_0_28px_hsl(var(--success)/0.6)] transition-shadow"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Rainbow bar */}
        <div className="rainbow-bar mt-4 h-1 rounded-full" />
      </motion.div>

      {/* ── Meu Saldo (compact) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
        className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Meu Saldo</p>
            <p className="text-lg font-bold text-foreground">
              {loading ? <SkeletonValue width="w-20" className="h-5" /> : showBalance ? <AnimatedCounter value={meuSaldo} prefix="R$&nbsp;" /> : "R$&nbsp;••••"}
            </p>
          </div>
        </div>
        <button
          onClick={onAddSaldo}
          className="h-8 px-3 rounded-lg bg-success text-success-foreground flex items-center gap-1.5 text-xs font-bold shadow-[0_0_12px_hsl(var(--success)/0.3)] hover:shadow-[0_0_20px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 200 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => action.key === "addSaldo" ? onAddSaldo() : onNavigate(action.key)}
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
            label: "Total Depósitos",
            value: totalDeposited,
            isCurrency: true,
            icon: ArrowDownLeft,
            color: "text-primary",
            bg: "bg-primary/10",
            sub: `${txCount} transações`,
            trend: "up" as const,
          },
          {
            label: "Saldo Revendedores",
            value: saldoCarteiras,
            isCurrency: true,
            icon: Wallet,
            color: "text-warning",
            bg: "bg-warning/10",
            sub: "nas carteiras",
            trend: null,
          },
          {
            label: "Recargas",
            value: totalRec,
            isCurrency: false,
            icon: Smartphone,
            color: "text-success",
            bg: "bg-success/10",
            sub: `${successRec} OK · ${pendingRec} pendentes`,
            trend: null,
          },
          {
            label: "Ticket Médio",
            value: ticketMedio,
            isCurrency: true,
            icon: DollarSign,
            color: "text-accent",
            bg: "bg-accent/10",
            sub: "por recarga",
            trend: null,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05, type: "spring", stiffness: 180 }}
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
            {card.sub && (
              <div className="flex items-center gap-1 mt-1.5">
                {card.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                <span className="text-[10px] font-medium text-muted-foreground">
                  {card.sub}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
