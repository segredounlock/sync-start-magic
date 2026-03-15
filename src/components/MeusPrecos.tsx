import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { Currency } from "@/components/ui/Currency";
import { SkeletonCard } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Info, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";

interface PricingValue {
  value: number;
  cost: number; // base cost from global pricing_rules
  userCost: number; // reseller's custom cost (regra_valor)
  profit: number; // margin the reseller adds
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

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: ops }, { data: globalRules }, { data: resellerRules }, { data: marginConfig }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", userId),
        supabase.from("system_config").select("key, value").in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]),
      ]);

      if (!ops) return;

      // Parse global margin settings
      const marginMap: Record<string, string> = {};
      (marginConfig || []).forEach((c: any) => { marginMap[c.key] = c.value; });
      const globalMarginEnabled = marginMap.defaultMarginEnabled === "true";
      const globalMarginType = marginMap.defaultMarginType || "fixo";
      const globalMarginValue = parseFloat(marginMap.defaultMarginValue || "0") || 0;

      // If reseller has ANY custom rules, global margin doesn't apply to them
      const hasAnyCustomRules = (resellerRules || []).length > 0;
      const useGlobalMargin = globalMarginEnabled && !hasAnyCustomRules;

      const result: OperadoraPricing[] = ops.map((op) => {
        const valores = (op.valores as unknown as number[]) || [];
        const values: PricingValue[] = valores.map((v) => {
          const gRule = (globalRules || []).find((r) => r.operadora_id === op.id && Number(r.valor_recarga) === v);
          const rRule = (resellerRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);

          const apiCost = gRule ? Number(gRule.custo) : v;

          // Global margin only applies if reseller has NO custom rules at all
          let baseCost: number;
          if (useGlobalMargin) {
            baseCost = globalMarginType === "percentual"
              ? apiCost * (1 + globalMarginValue / 100)
              : apiCost + globalMarginValue;
          } else {
            baseCost = gRule
              ? gRule.tipo_regra === "fixo" ? Number(gRule.regra_valor) : Number(gRule.custo) * (1 + Number(gRule.regra_valor) / 100)
              : v;
          }

          const hasCustom = !!rRule;
          const profit = hasCustom ? Number(rRule!.regra_valor) - baseCost : 0;
          const userCost = hasCustom ? Number(rRule!.regra_valor) : baseCost;

          return { value: v, cost: baseCost, userCost, profit: Math.max(0, profit), operadoraId: op.id, hasCustom };
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
    const finalPrice = pv.cost + profit;
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
      // Update local state
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
    const allKeys = op.values.map((v) => `${opId}_${v.value}`);
    const allSelected = allKeys.every((k) => selectedValues.has(k));
    setSelectedValues((prev) => {
      const next = new Set(prev);
      allKeys.forEach((k) => allSelected ? next.delete(k) : next.add(k));
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

      {/* Info badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
        <Info className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-primary">Lucro é somado ao custo base.</span>
      </div>

      {/* Operator Tabs */}
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">
              <span className="font-bold text-foreground">{activeOp.values.length}</span> produtos listados
            </span>
            <button
              onClick={() => selectAllForOperadora(activeOp.id)}
              className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              <CheckSquare className="h-4 w-4" />
              Selecionar Todos de {activeOp.nome.toUpperCase()}
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
