import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save } from "lucide-react";

interface ClientPricingValue {
  value: number;
  baseCost: number;       // reseller's cost (from pricing_rules or reseller_pricing_rules)
  defaultProfit: number;  // reseller's standard profit (regra_valor - baseCost)
  clientProfit: number | null; // custom profit for this client (null = use default)
  operadoraId: string;
}

interface ClientPricingOperadora {
  id: string;
  nome: string;
  values: ClientPricingValue[];
}

interface ClientPricingModalProps {
  open: boolean;
  onClose: () => void;
  resellerId: string;
  clientId: string;
  clientName: string;
}

export function ClientPricingModal({ open, onClose, resellerId, clientId, clientName }: ClientPricingModalProps) {
  const [operadoras, setOperadoras] = useState<ClientPricingOperadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [editedProfits, setEditedProfits] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: ops }, { data: globalRules }, { data: resellerRules }, { data: clientRules }, { data: marginConfig }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", resellerId),
        (supabase.from("client_pricing_rules" as any) as any).select("*").eq("reseller_id", resellerId).eq("client_id", clientId),
        supabase.from("system_config").select("key, value").in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]),
      ]);

      if (!ops) return;

      // Parse global margin settings
      const marginMap: Record<string, string> = {};
      (marginConfig || []).forEach((c: any) => { marginMap[c.key] = c.value; });
      const globalMarginEnabled = marginMap.defaultMarginEnabled === "true";
      const globalMarginType = marginMap.defaultMarginType || "fixo";
      const globalMarginValue = parseFloat(marginMap.defaultMarginValue || "0") || 0;

      const result: ClientPricingOperadora[] = ops.map((op: any) => {
        const valores = (op.valores as number[]) || [];
        const values: ClientPricingValue[] = valores.map((v: number) => {
          const gRule = (globalRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);
          const rRule = (resellerRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);
          const cRule = (clientRules || []).find((r: any) => r.operadora_id === op.id && Number(r.valor_recarga) === v);

          const apiCost = gRule ? Number(gRule.custo) : v;

          // Base cost: apply global margin if enabled (same logic as MeusPrecos)
          let baseCost: number;
          if (globalMarginEnabled && globalMarginValue > 0 && gRule) {
            baseCost = globalMarginType === "percentual"
              ? apiCost * (1 + globalMarginValue / 100)
              : apiCost + globalMarginValue;
          } else if (gRule) {
            baseCost = gRule.tipo_regra === "fixo"
              ? (Number(gRule.regra_valor) > 0 ? Number(gRule.regra_valor) : apiCost)
              : apiCost * (1 + Number(gRule.regra_valor) / 100);
          } else {
            baseCost = apiCost; // No global rule = use API cost (not face value)
          }

          // Default profit = reseller's standard markup
          const defaultProfit = rRule
            ? Number(rRule.regra_valor) - baseCost
            : 0;

          // Client-specific profit (null means using default)
          const clientProfit = cRule ? Number(cRule.lucro) : null;

          return { value: v, baseCost, defaultProfit: Math.max(0, defaultProfit), clientProfit, operadoraId: op.id };
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
  }, [resellerId, clientId]);

  useEffect(() => {
    if (open) {
      fetchData();
      setEditedProfits({});
    }
  }, [open, fetchData]);

  const getEditKey = (opId: string, value: number) => `${opId}_${value}`;

  const getDisplayProfit = (pv: ClientPricingValue): string => {
    const key = getEditKey(pv.operadoraId, pv.value);
    if (editedProfits[key] !== undefined) return editedProfits[key];
    if (pv.clientProfit !== null) return pv.clientProfit.toFixed(2);
    return pv.defaultProfit.toFixed(2);
  };

  const isUsingDefault = (pv: ClientPricingValue): boolean => {
    const key = getEditKey(pv.operadoraId, pv.value);
    if (editedProfits[key] !== undefined) return false;
    return pv.clientProfit === null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Collect all values with edits or existing client rules
      const upserts: any[] = [];
      for (const op of operadoras) {
        for (const pv of op.values) {
          const key = getEditKey(pv.operadoraId, pv.value);
          const edited = editedProfits[key];
          if (edited !== undefined) {
            const lucro = parseFloat(edited) || 0;
            if (lucro < 0) {
              toast.error(`Lucro não pode ser negativo (${op.nome} R$ ${pv.value})`);
              setSaving(false);
              return;
            }
            upserts.push({
              reseller_id: resellerId,
              client_id: clientId,
              operadora_id: pv.operadoraId,
              valor_recarga: pv.value,
              lucro,
            });
          }
        }
      }

      if (upserts.length === 0) {
        toast.info("Nenhuma alteração para salvar.");
        onClose();
        return;
      }

      const { error } = await (supabase.from("client_pricing_rules" as any) as any).upsert(upserts, {
        onConflict: "reseller_id,client_id,operadora_id,valor_recarga",
      });
      if (error) throw error;

      toast.success(`Preços exclusivos de ${clientName} salvos!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const activeOp = operadoras.find((o) => o.id === activeTab);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Lucro Customizado para {clientName}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Defina margens exclusivas para este indicado. Deixe em branco para usar seu lucro padrão.
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Operator Tabs */}
          {!loading && operadoras.length > 0 && (
            <div className="flex gap-1 px-5 pt-4 pb-2">
              {operadoras.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setActiveTab(op.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border-b-2 ${
                    activeTab === op.id
                      ? "text-primary border-primary bg-primary/5"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {op.nome.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : activeOp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOp.values.map((pv) => {
                  const key = getEditKey(pv.operadoraId, pv.value);
                  const displayProfit = getDisplayProfit(pv);
                  const usingDefault = isUsingDefault(pv);

                  return (
                    <div key={key} className="border border-border rounded-xl p-4 bg-background/50">
                      {/* Recharge value */}
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Recarga</span>
                        <span className="text-xl font-bold text-foreground">R$ {pv.value.toFixed(2)}</span>
                      </div>

                      {/* Info row */}
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1 bg-muted/30 rounded-lg px-2.5 py-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Seu Custo</p>
                          <p className="text-sm font-bold text-foreground">R$ {pv.baseCost.toFixed(2)}</p>
                        </div>
                        <div className="flex-1 bg-primary/10 rounded-lg px-2.5 py-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-primary font-semibold">Lucro Padrão</p>
                          <p className="text-sm font-bold text-primary">R$ {pv.defaultProfit.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Custom profit input */}
                      <div>
                        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-warning font-semibold mb-1.5">
                          <Star className="h-3 w-3" />
                          Lucro p/ Este Usuário
                        </label>
                        <div className="flex items-center gap-1 border border-border rounded-lg px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                          <span className="text-sm text-muted-foreground">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={pv.defaultProfit.toFixed(2)}
                            value={editedProfits[key] ?? (pv.clientProfit !== null ? pv.clientProfit.toFixed(2) : "")}
                            onChange={(e) => setEditedProfits((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="flex-1 bg-transparent outline-none text-sm font-semibold text-foreground"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {usingDefault ? "Usando lucro padrão" : "Lucro customizado"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma operadora encontrada.</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 pt-3 border-t border-border">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(editedProfits).length === 0}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              {saving ? <span className="animate-spin">⟳</span> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ClientPricingModal;
