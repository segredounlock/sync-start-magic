import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { Currency } from "@/components/ui/Currency";
import { SkeletonCard } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Info, CheckSquare, ChevronDown, ChevronUp, Users, ArrowRight, Smartphone, GitBranch, DollarSign, Percent, Tag } from "lucide-react";
import { InfoCard } from "@/components/InfoCard";

interface PricingValue {
  value: number;
  cost: number;
  apiCost: number;
  userCost: number;
  profit: number;
  operadoraId: string;
  hasCustom: boolean;
}

interface OperadoraPricing {
  id: string;
  nome: string;
  values: PricingValue[];
}

interface MeusPrecosProps {
  userId: string;
}

export function MeusPrecos({ userId }: MeusPrecosProps) {
  const [operadoras, setOperadoras] = useState<OperadoraPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [bulkProfit, setBulkProfit] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [editedProfits, setEditedProfits] = useState<Record<string, string>>({});
  const [showDiagram, setShowDiagram] = useState(false);
  const [commissionConfig, setCommissionConfig] = useState({ direct: "100", indirect: "10" });

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: ops }, { data: globalRules }, { data: resellerRules }, { data: resellerBaseRules }, { data: marginConfig }, { data: commConfig }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", userId),
        (supabase.from("reseller_base_pricing_rules" as any) as any).select("*").eq("user_id", userId),
        supabase.from("system_config").select("key, value").in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]),
        supabase.from("system_config").select("key, value").in("key", ["directCommissionPercent", "indirectCommissionPercent"]),
      ]);

      if (!ops) return;

      // Parse global margin settings
      const marginMap: Record<string, string> = {};
      (marginConfig || []).forEach((c: any) => { marginMap[c.key] = c.value; });
      const globalMarginEnabled = marginMap.defaultMarginEnabled === "true";
      const globalMarginType = marginMap.defaultMarginType || "fixo";
      const globalMarginValue = parseFloat(marginMap.defaultMarginValue || "0") || 0;

      // Parse commission config
      const commMap: Record<string, string> = {};
      (commConfig || []).forEach((c: any) => { commMap[c.key] = c.value; });
      setCommissionConfig({
        direct: commMap.directCommissionPercent || "100",
        indirect: commMap.indirectCommissionPercent || "10",
      });

      const result: OperadoraPricing[] = ops.map((op) => {
        const valores = (op.valores as unknown as number[]) || [];
        const values: PricingValue[] = valores.map((v) => {
          const gRule = (globalRules || []).find((r) => r.operadora_id === op.id && Number(r.valor_recarga) === v);
          const rRule = (resellerRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);
          const baseRule = (resellerBaseRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);

          const apiCost = gRule ? Number(gRule.custo) : v;

          let baseCost: number;
          if (baseRule) {
            baseCost = baseRule.tipo_regra === "fixo"
              ? (Number(baseRule.regra_valor) > 0 ? Number(baseRule.regra_valor) : Number(baseRule.custo))
              : Number(baseRule.custo) * (1 + Number(baseRule.regra_valor) / 100);
          } else if (globalMarginEnabled && globalMarginValue > 0 && gRule) {
            baseCost = globalMarginType === "percentual"
              ? apiCost * (1 + globalMarginValue / 100)
              : apiCost + globalMarginValue;
          } else if (gRule) {
            baseCost = gRule.tipo_regra === "fixo"
              ? (Number(gRule.regra_valor) > 0 ? Number(gRule.regra_valor) : apiCost)
              : apiCost * (1 + Number(gRule.regra_valor) / 100);
          } else {
            baseCost = apiCost;
          }

          const hasCustom = !!rRule;
          const profit = hasCustom ? Number(rRule!.regra_valor) - baseCost : 0;
          const userCost = hasCustom ? Number(rRule!.regra_valor) : baseCost;

          return { value: v, cost: baseCost, apiCost, userCost, profit: Math.max(0, profit), operadoraId: op.id, hasCustom };
        });
        return { id: op.id, nome: op.nome, values };
      });

      setOperadoras(result);
      if (!activeTab && result.length > 0) setActiveTab(result[0].id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar preços");
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => { fetchPricing(); }, []);

  const handleProfitChange = (opId: string, value: number, rawValue: string) => {
    const key = `${opId}_${value}`;
    setEditedProfits((prev) => ({ ...prev, [key]: rawValue }));
  };

  const getDisplayProfit = (pv: PricingValue): number => {
    const key = `${pv.operadoraId}_${pv.value}`;
    const edited = editedProfits[key];
    if (edited !== undefined) return parseFloat(edited) || 0;
    return pv.profit;
  };

  const getDisplayProfitRaw = (pv: PricingValue): string => {
    const key = `${pv.operadoraId}_${pv.value}`;
    const edited = editedProfits[key];
    if (edited !== undefined) return edited;
    return pv.profit.toFixed(2);
  };

  const getFinalPrice = (pv: PricingValue) => {
    return pv.cost + getDisplayProfit(pv);
  };

  const saveRule = async (pv: PricingValue) => {
    const key = `${pv.operadoraId}_${pv.value}`;
    const profit = getDisplayProfit(pv);
    if (profit < 0) {
      toast.error("Seu lucro não pode ser negativo. O preço mínimo é o seu custo base.");
      return;
    }
    const finalPrice = pv.cost + profit;
    // Extra safety: never allow final price below API cost (pv.apiCost)
    if (finalPrice < pv.apiCost) {
      toast.error("O preço final não pode ficar abaixo do custo da API.");
      return;
    }
    setSaving(key);
    try {
      const { error } = await (supabase.from("reseller_pricing_rules") as any).upsert({
        user_id: userId,
        operadora_id: pv.operadoraId,
        valor_recarga: pv.value,
        custo: pv.cost,
        tipo_regra: "fixo",
        regra_valor: finalPrice,
      }, { onConflict: "user_id,operadora_id,valor_recarga" });

      if (error) throw error;
      toast.success(`Preço de R$ ${pv.value} atualizado!`);
      setEditedProfits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      fetchPricing();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(null);
    }
  };

  const toggleSelect = (opId: string, value: number) => {
    const key = `${opId}_${value}`;
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectAllForOperadora = (opId: string) => {
    const op = operadoras.find((o) => o.id === opId);
    if (!op) return;
    const selectableKeys = op.values.map((v) => `${opId}_${v.value}`);
    const allSelected = selectableKeys.every((k) => selectedValues.has(k));
    setSelectedValues((prev) => {
      const next = new Set(prev);
      selectableKeys.forEach((k) => allSelected ? next.delete(k) : next.add(k));
      return next;
    });
  };

  const applyBulkProfit = async () => {
    const profit = parseFloat(bulkProfit);
    if (isNaN(profit) || profit < 0) {
      toast.error("Informe um valor de lucro válido");
      return;
    }
    const activeOp = operadoras.find((o) => o.id === activeTab);
    if (!activeOp) return;

    const toUpdate = activeOp.values.filter((v) => selectedValues.has(`${v.operadoraId}_${v.value}`));
    if (toUpdate.length === 0) {
      toast.error("Selecione ao menos um valor");
      return;
    }

    setSaving("bulk");
    try {
      const upserts = toUpdate.map((pv) => ({
        user_id: userId,
        operadora_id: pv.operadoraId,
        valor_recarga: pv.value,
        custo: pv.cost,
        tipo_regra: "fixo" as const,
        regra_valor: pv.cost + profit,
      }));

      const { error } = await (supabase.from("reseller_pricing_rules") as any).upsert(upserts, { onConflict: "user_id,operadora_id,valor_recarga" });
      if (error) throw error;
      toast.success(`${toUpdate.length} preços atualizados!`);
      setSelectedValues(new Set());
      setBulkProfit("");
      fetchPricing();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar em lote");
    } finally {
      setSaving(null);
    }
  };

  const activeOp = operadoras.find((o) => o.id === activeTab);

  if (loading) return <div className="space-y-4 p-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meus Preços</h2>
        <p className="text-sm text-muted-foreground mt-1">Defina sua margem de lucro para cada produto.</p>
      </div>

      <InfoCard title="Como funciona" items={[
        { icon: DollarSign, label: "Custo Base", description: "Valor fixo da operadora que você paga por cada recarga." },
        { icon: Percent, label: "Seu Lucro", description: "Valor que você define e é somado ao custo base para formar o preço final." },
        { icon: Tag, label: "Preço Final", description: "Custo Base + Seu Lucro = valor que o cliente paga." },
        { icon: CheckSquare, label: "Edição em Lote", description: "Selecione vários valores e aplique o mesmo lucro de uma vez." },
      ]} />

      {/* Diagrama da cadeia de indicação - colapsável */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowDiagram(!showDiagram)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Como funciona a cadeia de indicação</span>
          </div>
          {showDiagram ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showDiagram && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 bg-muted/10">
                {/* Horizontal flow */}
                <div className="flex items-center justify-center gap-1 sm:gap-4 overflow-x-auto">
                  {/* Avô */}
                  <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-purple-500/15 border-2 border-purple-500/30 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground">Avô</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight">Quem te<br/>indicou</span>
                    <span className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[9px] sm:text-[10px] font-bold">
                      {commissionConfig.indirect}%
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5 -mt-4 sm:-mt-6 shrink-0">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/60" />
                  </div>

                  {/* Você */}
                  <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground">Você</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight">Vende pro<br/>cliente</span>
                    <span className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] sm:text-[10px] font-bold">
                      {commissionConfig.direct}%
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5 -mt-4 sm:-mt-6 shrink-0">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/60" />
                  </div>

                  {/* Cliente */}
                  <div className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px]">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground">Cliente</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight">Compra a<br/>recarga</span>
                    <span className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] sm:text-[10px] font-bold">
                      💰 Paga
                    </span>
                  </div>
                </div>

                {/* Explicações claras abaixo do diagrama */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-purple-500/5 border border-purple-500/15 p-2.5">
                    <p className="font-bold text-purple-400 mb-1">👴 Avô</p>
                    <p className="text-muted-foreground leading-relaxed">Te convidou pra plataforma. Ganha <strong>{commissionConfig.indirect}%</strong> do seu lucro em cada venda.</p>
                    <p className="text-muted-foreground mt-1 italic">Ex: você lucra R$ 5 → ele ganha R$ {(5 * Number(commissionConfig.indirect) / 100).toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5">
                    <p className="font-bold text-primary mb-1">👨 Você</p>
                    <p className="text-muted-foreground leading-relaxed">Define o preço e fica com <strong>{commissionConfig.direct}%</strong> do lucro. Lucro = preço cobrado − seu custo.</p>
                    <p className="text-muted-foreground mt-1 italic">Ex: custo R$ 12, cobra R$ 15 → lucro R$ 3</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2.5">
                    <p className="font-bold text-emerald-400 mb-1">📱 Cliente</p>
                    <p className="text-muted-foreground leading-relaxed">Compra pelo preço que você definir abaixo. Maior preço = maior lucro!</p>
                    <p className="text-muted-foreground mt-1 italic">Dica: preços exclusivos em "Minha Rede"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border">
        {operadoras.map((op) => (
          <button
            key={op.id}
            onClick={() => setActiveTab(op.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === op.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base">🏢</span>
            {op.nome.toUpperCase()}
          </button>
        ))}
      </div>

      {activeOp && (
        <>
          {/* Count + Select All */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              <span className="font-bold text-foreground">{activeOp.values.length}</span> produtos listados
            </span>
            <button
              onClick={() => selectAllForOperadora(activeOp.id)}
              className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline shrink-0"
            >
              <CheckSquare className="h-4 w-4" />
              Selecionar Todos
            </button>
          </div>

          {/* Values Cards */}
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {activeOp.values.map((pv) => {
              const key = `${pv.operadoraId}_${pv.value}`;
              const isSelected = selectedValues.has(key);
               const displayProfit = getDisplayProfit(pv);
               const displayProfitRaw = getDisplayProfitRaw(pv);
               const finalPrice = getFinalPrice(pv);
               const hasEdits = editedProfits[key] !== undefined;

              return (
                <motion.div
                  key={key}
                  layout
                  className={`glass-card rounded-xl p-4 border-2 transition-colors ${
                    isSelected ? "border-primary shadow-[0_0_16px_hsl(var(--primary)/0.15)]" : "border-border"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Valor da Recarga</p>
                      <p className="text-xl font-bold text-foreground">R$ {pv.value.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => toggleSelect(pv.operadoraId, pv.value)}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {isSelected && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seu Custo:</span>
                      <span className="font-semibold text-foreground">R$ {pv.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Seu Lucro:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-xs">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={displayProfitRaw}
                          onChange={(e) => handleProfitChange(pv.operadoraId, pv.value, e.target.value)}
                          className="w-20 text-right bg-background border border-border rounded-lg px-2 py-1 text-sm font-semibold focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-border">
                      <span className="font-semibold text-muted-foreground">PREÇO FINAL</span>
                      <span className="font-bold text-success text-base">R$ {finalPrice.toFixed(2)}</span>
                    </div>
                  </div>


                  {/* Save button */}
                  {hasEdits && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => saveRule(pv)}
                      disabled={saving === key}
                      className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving === key ? <span className="animate-spin">⟳</span> : <Save className="h-4 w-4" />}
                      Salvar Alteração
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bulk actions */}
          {selectedValues.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-20 z-30 glass-card rounded-xl p-4 border-2 border-primary shadow-[0_-4px_30px_hsl(var(--primary)/0.2)]"
            >
              <button onClick={() => setShowBulk(!showBulk)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {selectedValues.size}
                  </span>
                  <span className="text-sm font-semibold text-foreground">itens selecionados</span>
                </div>
                {showBulk ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronUp className="h-5 w-5 text-primary" />}
              </button>

              <AnimatePresence>
                {showBulk && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex gap-2 mt-3">
                      <div className="flex items-center gap-1 flex-1 bg-background border border-border rounded-lg px-3">
                        <span className="text-muted-foreground text-sm">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Lucro"
                          value={bulkProfit}
                          onChange={(e) => setBulkProfit(e.target.value)}
                          className="w-full py-2 bg-transparent outline-none text-sm font-semibold"
                        />
                      </div>
                      <button
                        onClick={applyBulkProfit}
                        disabled={saving === "bulk"}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                      >
                        {saving === "bulk" ? "..." : "Aplicar a Todos"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default MeusPrecos;
