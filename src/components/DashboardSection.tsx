import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wallet, Smartphone, Users, Banknote, Share2,
  TrendingUp, DollarSign, ShoppingCart, UserPlus,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { formatDateLongUpperBR, toLocalDateKey, getTodayLocalKey } from "@/lib/timezone";
import { SkeletonValue } from "@/components/Skeleton";

interface DashboardSectionProps {
  saldo: number;
  loading: boolean;
  userId: string;
  onNavigateTab: (tab: string) => void;
  isClientMode?: boolean;
}

type Period = "hoje" | "mes" | "outro";

export function DashboardSection({ saldo, loading, userId, onNavigateTab, isClientMode }: DashboardSectionProps) {
  const [period, setPeriod] = useState<Period>("mes");
  const [stats, setStats] = useState({ faturamento: 0, comissoes: 0, vendas: 0, novosClientes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [comissaoSaque, setComissaoSaque] = useState(0);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const today = new Date();
  const dateLabel = formatDateLongUpperBR(today.toISOString());

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const now = new Date();
      let from: string;
      if (period === "hoje") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (period === "mes") {
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else {
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      }

      const [{ data: recs }, { data: comms }, { data: clients }] = await Promise.all([
        supabase
          .from("recargas")
          .select("valor, custo, status")
          .eq("user_id", userId)
          .gte("created_at", from)
          .in("status", ["completed", "concluida"]),
        supabase
          .from("referral_commissions")
          .select("amount")
          .eq("user_id", userId)
          .gte("created_at", from),
        isClientMode
          ? { data: [] }
          : supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("reseller_id", userId)
              .gte("created_at", from),
      ]);

      const faturamento = (recs || []).reduce((s, r) => s + Number(r.custo || 0), 0);
      const comissoes = (comms || []).reduce((s, c) => s + Number(c.amount || 0), 0);
      const vendas = (recs || []).length;

      setStats({
        faturamento,
        comissoes,
        vendas,
        novosClientes: typeof clients === "number" ? clients : 0,
      });

      // Fetch comissão saque balance
      const { data: saldoComissao } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "comissao")
        .maybeSingle();
      setComissaoSaque(Number(saldoComissao?.valor) || 0);
    } catch (e) {
      console.error("Dashboard stats error:", e);
    }
    setStatsLoading(false);
  }, [userId, period, isClientMode]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const quickActions = [
    { icon: Smartphone, label: "Recarregar", sub: "Vender créditos", tab: "recarga", color: "text-primary", bg: "bg-primary/10" },
    ...(!isClientMode ? [
      { icon: Users, label: "Minha Rede", sub: "Gerenciar equipe", tab: "minharede", color: "text-accent-foreground", bg: "bg-accent/10" },
      { icon: Banknote, label: "Sacar", sub: "Retirar lucros", tab: "extrato", color: "text-success", bg: "bg-success/10" },
      { icon: Share2, label: "Convidar", sub: "Expandir rede", tab: "contatos", color: "text-destructive", bg: "bg-destructive/10" },
    ] : [
      { icon: Wallet, label: "Depositar", sub: "Adicionar saldo", tab: "addSaldo", color: "text-success", bg: "bg-success/10" },
    ]),
  ];

  const kpis = [
    { icon: DollarSign, label: "Faturamento", value: stats.faturamento, isCurrency: true, color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "Comissões", value: stats.comissoes, isCurrency: true, color: "text-success", bg: "bg-success/10" },
    { icon: ShoppingCart, label: "Vendas Realizadas", value: stats.vendas, isCurrency: false, color: "text-accent-foreground", bg: "bg-accent/10" },
    ...(!isClientMode ? [
      { icon: UserPlus, label: "Novos Clientes", value: stats.novosClientes, isCurrency: false, color: "text-warning", bg: "bg-warning/10" },
    ] : []),
  ];

  return (
    <div className="space-y-5">
      {/* Date */}
      <div>
        <p className="text-xs text-muted-foreground">{dateLabel}</p>
      </div>

      {/* Saldo Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        {/* Saldo Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 text-primary-foreground shadow-lg"
        >
          <div className="absolute top-3 right-3 opacity-20">
            <Wallet className="h-10 w-10" />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Saldo de Recargas</p>
          <p className="text-3xl font-bold mt-1">
            {loading ? <SkeletonValue width="w-28" className="h-8 bg-white/20" /> : <AnimatedCounter value={saldo} prefix="R$&nbsp;" />}
          </p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Comissões (Saque)</p>
            <p className="text-lg font-bold">
              {loading ? <SkeletonValue width="w-20" className="h-5 bg-white/20" /> : fmt(comissaoSaque)}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("addSaldo")}
            className="mt-4 w-full py-2.5 rounded-xl bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors flex items-center justify-center gap-2"
          >
            + Depositar
          </button>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a, i) => (
            <motion.button
              key={a.tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigateTab(a.tab)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Relatório de Desempenho */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Relatório de Desempenho</h2>
            <p className="text-xs text-muted-foreground">Acompanhe suas vendas e comissões no período selecionado.</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {([
              { key: "hoje" as Period, label: "Hoje" },
              { key: "mes" as Period, label: "Mês" },
              { key: "outro" as Period, label: "Outro" },
            ]).map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid ${isClientMode ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"} gap-3`}>
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading
                  ? <SkeletonValue width="w-16" className="h-7" />
                  : kpi.isCurrency
                    ? <AnimatedCounter value={kpi.value} prefix="R$&nbsp;" />
                    : kpi.value
                }
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
