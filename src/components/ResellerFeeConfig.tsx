import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { DollarSign, Percent, Save, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { applyCurrencyMask, parseCurrencyMask } from "@/lib/currencyMask";

interface ResellerFeeConfigProps {
  userId: string;
}

export function ResellerFeeConfig({ userId }: ResellerFeeConfigProps) {
  const [feeType, setFeeType] = useState<"fixo" | "percentual">("fixo");
  const [feeValue, setFeeValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("reseller_deposit_fees" as any)
        .select("*")
        .eq("reseller_id", userId)
        .maybeSingle();

      if (data) {
        setFeeType((data as any).fee_type || "fixo");
        const val = Number((data as any).fee_value) || 0;
        if ((data as any).fee_type === "percentual") {
          setFeeValue(val > 0 ? val.toString().replace(".", ",") : "");
        } else {
          setFeeValue(val > 0 ? applyCurrencyMask(Math.round(val * 100).toString()) : "");
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let numericValue = 0;
      if (feeType === "percentual") {
        numericValue = parseFloat(feeValue.replace(",", ".")) || 0;
      } else {
        numericValue = parseCurrencyMask(feeValue);
      }

      const { error } = await (supabase.from("reseller_deposit_fees" as any) as any).upsert({
        reseller_id: userId,
        fee_type: feeType,
        fee_value: numericValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: "reseller_id" });

      if (error) throw error;
      toast.success("Taxa de depósito salva!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar taxa");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0" />
        <span>Configure a taxa que seus membros pagam ao depositar. Se não configurar, será usada a taxa global do sistema.</span>
      </div>

      {/* Fee Type Toggle */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
          Tipo de Taxa
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setFeeType("fixo"); setFeeValue(""); }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all border ${
              feeType === "fixo"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Valor Fixo
          </button>
          <button
            onClick={() => { setFeeType("percentual"); setFeeValue(""); }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all border ${
              feeType === "percentual"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Percent className="h-4 w-4" />
            Percentual
          </button>
        </div>
      </div>

      {/* Fee Value Input */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
          {feeType === "percentual" ? "Percentual (%)" : "Valor Fixo (R$)"}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            {feeType === "percentual" ? "%" : "R$"}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={feeValue}
            onChange={(e) => {
              if (feeType === "percentual") {
                const v = e.target.value.replace(/[^0-9,]/g, "");
                setFeeValue(v);
              } else {
                setFeeValue(applyCurrencyMask(e.target.value));
              }
            }}
            placeholder={feeType === "percentual" ? "Ex: 2,5" : "0,00"}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        {feeType === "percentual" && (
          <p className="text-xs text-muted-foreground mt-1">
            Ex: 2,5 = 2,5% sobre o valor do depósito
          </p>
        )}
        {feeType === "fixo" && (
          <p className="text-xs text-muted-foreground mt-1">
            Ex: 1,00 = R$ 1,00 descontado de cada depósito
          </p>
        )}
      </div>

      {/* Preview */}
      {feeValue && (
        <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
          <p className="font-medium text-foreground">Prévia:</p>
          {(() => {
            const testAmount = 50;
            let fee = 0;
            if (feeType === "percentual") {
              const pct = parseFloat(feeValue.replace(",", ".")) || 0;
              fee = Math.round(testAmount * pct) / 100;
            } else {
              fee = parseCurrencyMask(feeValue);
            }
            fee = Math.round(fee * 100) / 100;
            const net = Math.max(0, testAmount - fee);
            return (
              <>
                <p className="text-muted-foreground">
                  Depósito de <span className="font-semibold text-foreground">R$ 50,00</span>
                </p>
                <p className="text-muted-foreground">
                  Taxa: <span className="font-semibold text-destructive">-R$ {fee.toFixed(2).replace(".", ",")}</span>
                </p>
                <p className="text-muted-foreground">
                  Creditado: <span className="font-semibold text-emerald-500">R$ {net.toFixed(2).replace(".", ",")}</span>
                </p>
              </>
            );
          })()}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar Taxa
      </button>
    </motion.div>
  );
}
