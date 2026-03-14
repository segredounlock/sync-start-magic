import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Smartphone, Users, Banknote, Share2,
  TrendingUp, DollarSign, ShoppingCart, UserPlus, AlertCircle,
  HelpCircle, X, Copy, MessageCircle,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { formatDateFullTitleBR, toLocalDateKey, getTodayLocalKey } from "@/lib/timezone";
import { SkeletonValue } from "@/components/Skeleton";

interface DashboardSectionProps {
  saldo: number;
  loading: boolean;
  userId: string;
  userName: string;
  onNavigateTab: (tab: string) => void;
  isClientMode?: boolean;
  salesToolsEnabled?: boolean;
}

type Period = "hoje" | "mes" | "outro";

interface DailyData { date: string; value: number }
interface OpData { name: string; value: number; color: string }

const OP_COLORS: Record<string, string> = {
  claro: "hsl(0 80% 55%)",
  vivo: "hsl(280 70% 55%)",
  tim: "hsl(220 80% 55%)",
  oi: "hsl(35 90% 55%)",
};

export function DashboardSection({ saldo, loading, userId, userName, onNavigateTab, isClientMode, salesToolsEnabled = true }: DashboardSectionProps) {
  const [period, setPeriod] = useState<Period>("mes");
  const [stats, setStats] = useState({ faturamento: 0, comissoes: 0, vendas: 0, novosClientes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [comissaoSaque, setComissaoSaque] = useState(0);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [opData, setOpData] = useState<OpData[]>([]);
  const [hasPendingPrices, setHasPendingPrices] = useState(false);
  const [showSaqueModal, setShowSaqueModal] = useState(false);
  const [showConvidarModal, setShowConvidarModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const today = new Date();
  const dateLabel = formatDateFullTitleBR(today.toISOString());

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

      const [{ data: recs }, { data: comms }, clientsResult] = await Promise.all([
        supabase
          .from("recargas")
          .select("valor, custo, status, operadora, created_at")
          .eq("user_id", userId)
          .gte("created_at", from)
          .in("status", ["completed", "concluida"]),
        supabase
          .from("referral_commissions")
          .select("amount")
          .eq("user_id", userId)
          .gte("created_at", from),
        isClientMode
          ? Promise.resolve({ count: 0 })
          : supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("reseller_id", userId)
              .gte("created_at", from),
      ]);

      const recsList = recs || [];
      const faturamento = recsList.reduce((s, r) => s + Number(r.custo || 0), 0);
      const comissoes = (comms || []).reduce((s, c) => s + Number(c.amount || 0), 0);
      const vendas = recsList.length;

      setStats({
        faturamento,
        comissoes,
        vendas,
        novosClientes: (clientsResult as any)?.count || 0,
      });

      // Build daily chart data
      const dailyMap: Record<string, number> = {};
      recsList.forEach(r => {
        const key = toLocalDateKey(r.created_at);
        dailyMap[key] = (dailyMap[key] || 0) + Number(r.custo || 0);
      });
      const sortedDays = Object.entries(dailyMap)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setDailyData(sortedDays);

      // Build operator chart data
      const opMap: Record<string, number> = {};
      recsList.forEach(r => {
        const op = (r.operadora || "Outros").toUpperCase();
        opMap[op] = (opMap[op] || 0) + Number(r.custo || 0);
      });
      setOpData(
        Object.entries(opMap)
          .map(([name, value]) => ({
            name,
            value,
            color: OP_COLORS[name.toLowerCase()] || "hsl(var(--muted-foreground))",
          }))
          .sort((a, b) => b.value - a.value)
      );

      // Fetch comissão saque balance
      const { data: saldoComissao } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "comissao")
        .maybeSingle();
      setComissaoSaque(Number(saldoComissao?.valor) || 0);

      // Check pending prices (reseller only)
      if (!isClientMode) {
        try {
          const [{ data: ops }, { data: globalRules }, { data: resellerRules }] = await Promise.all([
            supabase.from("operadoras").select("id, valores").eq("ativo", true),
            supabase
              .from("pricing_rules")
              .select("operadora_id, valor_recarga, tipo_regra, regra_valor, custo"),
            supabase
              .from("reseller_pricing_rules")
              .select("operadora_id, valor_recarga, regra_valor")
              .eq("user_id", userId),
          ]);

          const hasPending = (ops || []).some(op => {
            const vals = Array.isArray(op.valores) ? op.valores : [];

            return vals.some((rawV: any) => {
              const v = Number(rawV);

              const gRule = (globalRules || []).find(
                (r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v
              );

              const rRule = (resellerRules || []).find(
                (r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v
              );

              // Sem regra custom = pendente
              if (!rRule) return true;

              const baseCost = gRule
                ? gRule.tipo_regra === "fixo"
                  ? Number(gRule.regra_valor)
                  : Number(gRule.custo) * (1 + Number(gRule.regra_valor) / 100)
                : v;

              const finalPrice = Number(rRule.regra_valor);
              const profit = finalPrice - baseCost;

              // Lucro não definido (0 ou negativo) = pendente
              return profit <= 0;
            });
          });
          setHasPendingPrices(hasPending);
        } catch (e) {
          console.error("Pending prices check error:", e);
          setHasPendingPrices(false);
        }
      }
    } catch (e) {
      console.error("Dashboard stats error:", e);
    }
    setStatsLoading(false);
  }, [userId, period, isClientMode]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Fetch referral code
  useEffect(() => {
    if (isClientMode) return;
    supabase.from("profiles").select("referral_code").eq("id", userId).maybeSingle()
      .then(({ data }) => setReferralCode(data?.referral_code || ""));
  }, [userId, isClientMode]);

  const siteOrigin = window.location.origin;
  const referralLink = referralCode ? `${siteOrigin}/auth?ref=${referralCode}` : "";

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try { await navigator.clipboard.writeText(text); setCopied(type); setTimeout(() => setCopied(null), 2000); } catch {}
  };

  const shareWhatsApp = () => {
    const msg = `Faça suas recargas com desconto! Cadastre-se pelo meu link:\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const quickActions = [
    { icon: Smartphone, label: "Recarregar", sub: "Vender créditos", tab: "recarga", color: "text-primary", bg: "bg-primary/10" },
    ...(!isClientMode ? [
      { icon: Users, label: "Minha Rede", sub: "Gerenciar equipe", tab: "minharede", color: "text-accent-foreground", bg: "bg-accent/10" },
      { icon: Banknote, label: "Sacar", sub: "Retirar lucros", tab: "__saque__", color: "text-success", bg: "bg-success/10" },
      { icon: Share2, label: "Convidar", sub: "Expandir rede", tab: "__convidar__", color: "text-destructive", bg: "bg-destructive/10" },
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

  // Chart scaling
  const maxDaily = Math.max(...dailyData.map(d => d.value), 1);
  const opTotal = opData.reduce((s, o) => s + o.value, 0) || 1;

  return (
    <div className="space-y-5">
      {/* Greeting + Date */}
      <div>
        <p className="text-xs text-muted-foreground">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-foreground">Olá, {userName}!</h1>
      </div>

      {/* Pending Prices Alert */}
      {!isClientMode && hasPendingPrices && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-warning/10 border border-warning/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Preços Pendentes</p>
              <p className="text-xs text-muted-foreground">Alguns produtos ainda não têm seu lucro definido.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("meusprecos")}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            Configurar Agora
          </button>
        </motion.div>
      )}

      {/* Saldo Card + Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Saldo Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 text-primary-foreground shadow-lg"
        >
          <div className="absolute top-3 right-3 opacity-20">
            <Wallet className="h-8 w-8" />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Saldo de Recargas</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">
            {loading ? <SkeletonValue width="w-24" className="h-7 bg-white/20" /> : <AnimatedCounter value={saldo} prefix="R$&nbsp;" />}
          </p>
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Comissões (Saque)</p>
            <p className="text-base font-bold">
              {loading ? <SkeletonValue width="w-16" className="h-4 bg-white/20" /> : fmt(comissaoSaque)}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("addSaldo")}
            className="mt-3 w-full py-2 rounded-xl bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors flex items-center justify-center gap-1"
          >
            + Depositar
          </button>
        </motion.div>

        {/* Quick Actions */}
        {quickActions.map((a, i) => (
          <motion.button
            key={a.tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => a.tab === "__saque__" ? setShowSaqueModal(true) : a.tab === "__convidar__" ? setShowConvidarModal(true) : onNavigateTab(a.tab)}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Faturamento Diário */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Faturamento Diário</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md">Receita (R$)</span>
          </div>
          {dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Sem dados no período
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span>Faturamento</span>
              </div>
              <div className="h-48 flex items-end gap-1">
                {dailyData.map((d, i) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${fmt(d.value)}`}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((d.value / maxDaily) * 100, 4)}%` }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                      className="w-full rounded-t-md bg-primary/80 min-h-[4px]"
                    />
                    <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Por Operadora */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Por Operadora</h3>
          {opData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Sem dados no período
            </div>
          ) : (
            <div className="space-y-3">
              {opData.map((op, i) => {
                const pct = ((op.value / opTotal) * 100).toFixed(0);
                return (
                  <motion.div
                    key={op.name}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-foreground">{op.name}</span>
                      <span className="text-muted-foreground">{fmt(op.value)} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: op.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Saque */}
      <AnimatePresence>
        {showSaqueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowSaqueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm text-foreground">ATENÇÃO</span>
                </div>
                <button onClick={() => setShowSaqueModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col items-center px-6 py-6 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Solicitar Saque (PIX)</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Para realizar saques ou transferências, acesse a área detalhada da sua carteira.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 space-y-2">
                <button
                  onClick={() => { setShowSaqueModal(false); onNavigateTab("extrato"); }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Ir para Carteira
                </button>
                <button
                  onClick={() => setShowSaqueModal(false)}
                  className="w-full py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Convidar */}
      <AnimatePresence>
        {showConvidarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowConvidarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <span className="font-bold text-sm text-foreground">Expandir sua Rede</span>
                </div>
                <button onClick={() => setShowConvidarModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Compartilhe seus links abaixo. Novos usuários serão vinculados à sua rede e gerarão <strong className="text-foreground">lucro automático</strong> para você.
                </p>

                {/* Código */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5 block">Código de Indicação</label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
                      <Share2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-primary text-lg tracking-wider">{referralCode || "..."}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(referralCode, "code")}
                      className="px-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copied === "code" && <p className="text-[10px] text-success mt-1">Copiado!</p>}
                </div>

                {/* Link */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5 block">Link Direto de Cadastro</label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border overflow-hidden">
                      <Share2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{referralLink || "..."}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(referralLink, "link")}
                      className="px-3.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Leva diretamente para a tela de registro com seu código.</p>
                  {copied === "link" && <p className="text-[10px] text-success mt-0.5">Copiado!</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 flex gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="flex-1 py-3 rounded-xl bg-[hsl(142,70%,45%)] text-white font-bold text-sm hover:bg-[hsl(142,70%,40%)] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => setShowConvidarModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
