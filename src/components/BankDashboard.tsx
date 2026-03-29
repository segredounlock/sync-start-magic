import { motion, AnimatePresence } from "framer-motion";
import { Currency, IntVal, KpiCard } from "@/components/ui";
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
    <div className="space-y-5">
      {/* ── Balance Card (Seu Lucro) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 cursor-pointer"
        onClick={onShowLucroModal}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-success/8 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              Seu Lucro
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
              className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                  className={`text-4xl sm:text-4xl font-bold tracking-tight ${lucro >= 0 ? "text-success" : "text-destructive"}`}
                >
                  <Currency value={lucro} loading={loading} skeletonWidth="w-36" skeletonHeight="h-9" />
                </motion.p>
              ) : (
                <motion.p
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-4xl sm:text-4xl font-bold text-foreground tracking-tight"
                >
                  R${"\u00A0"}••••••
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Lucro percentage badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${lucro >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {lucro >= 0 ? "↑" : "↓"} {lucroPct.toFixed(1)}% margem
            </span>
            <span className="text-xs text-muted-foreground">
              sobre {showBalance ? fmt(totalCobrado) : "••••"} cobrado
            </span>
          </div>

          {/* Deposit button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onAddSaldo(); }}
            className="absolute right-5 top-5 w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--success)/0.4)] hover:shadow-[0_0_28px_hsl(var(--success)/0.6)] transition-shadow"
          >
            <Plus className="h-6 w-6" />
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
        className="flex items-center justify-between rounded-xl bg-card border border-border px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Meu Saldo</p>
            <p className="text-xl font-bold text-foreground">
              <Currency value={meuSaldo} loading={loading} hidden={!showBalance} skeletonWidth="w-20" skeletonHeight="h-5" />
            </p>
          </div>
        </div>
        <button
          onClick={onAddSaldo}
          className="h-10 px-4 rounded-lg bg-success text-success-foreground flex items-center gap-1.5 text-sm font-bold shadow-[0_0_12px_hsl(var(--success)/0.3)] hover:shadow-[0_0_20px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 200 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => action.key === "addSaldo" ? onAddSaldo() : onNavigate(action.key)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <span className="text-xs font-semibold text-foreground leading-tight text-center">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Stats Grid (2x2) ── */}
      <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className={`font-bold ${card.color}`} style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.875rem)' }}>
              {card.isCurrency ? (
                <Currency value={card.value} loading={loading} hidden={!showBalance} skeletonWidth="w-20" skeletonHeight="h-7" />
              ) : (
                <IntVal value={card.value} loading={loading} skeletonWidth="w-20" skeletonHeight="h-7" />
              )}
            </p>
            {card.sub && (
              <div className="flex items-center gap-1 mt-1.5">
                {card.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                <span className="text-xs font-medium text-muted-foreground">
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
