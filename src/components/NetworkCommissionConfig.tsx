import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { TrendingUp, ToggleRight, ToggleLeft, Save, Loader2, Users, GitBranch } from "lucide-react";
import { InfoCard } from "@/components/InfoCard";
import { motion } from "framer-motion";

interface CommissionState {
  directCommissionEnabled: string;
  directCommissionPercent: string;
  indirectCommissionEnabled: string;
  indirectCommissionPercent: string;
}

const DEFAULTS: CommissionState = {
  directCommissionEnabled: "true",
  directCommissionPercent: "100",
  indirectCommissionEnabled: "true",
  indirectCommissionPercent: "10",
};

const KEYS = Object.keys(DEFAULTS) as (keyof CommissionState)[];

export default function NetworkCommissionConfig() {
  const [config, setConfig] = useState<CommissionState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load current values
  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.from("system_config" as any) as any)
          .select("key, value")
          .in("key", KEYS);
        if (data) {
          const map: Record<string, string> = {};
          for (const row of data) map[row.key] = row.value ?? "";
          setConfig({
            directCommissionEnabled: map.directCommissionEnabled ?? DEFAULTS.directCommissionEnabled,
            directCommissionPercent: map.directCommissionPercent ?? DEFAULTS.directCommissionPercent,
            indirectCommissionEnabled: map.indirectCommissionEnabled ?? DEFAULTS.indirectCommissionEnabled,
            indirectCommissionPercent: map.indirectCommissionPercent ?? DEFAULTS.indirectCommissionPercent,
          });
        }
      } catch {
        toast.error("Erro ao carregar configurações de comissão.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = useCallback((key: "directCommissionEnabled" | "indirectCommissionEnabled") => {
    setConfig(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
    setDirty(true);
  }, []);

  const setPercent = useCallback((key: "directCommissionPercent" | "indirectCommissionPercent", val: string) => {
    const num = parseFloat(val);
    if (val !== "" && (isNaN(num) || num < 0 || num > 100)) return;
    setConfig(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    // Validate
    const dp = parseFloat(config.directCommissionPercent);
    const ip = parseFloat(config.indirectCommissionPercent);
    if (isNaN(dp) || dp < 0 || dp > 100) {
      toast.error("Percentual de comissão direta deve ser entre 0 e 100.");
      return;
    }
    if (isNaN(ip) || ip < 0 || ip > 100) {
      toast.error("Percentual de comissão indireta deve ser entre 0 e 100.");
      return;
    }

    setSaving(true);
    try {
      const upserts = KEYS.map(key => ({
        key,
        value: config[key],
      }));

      for (const item of upserts) {
        const { error } = await (supabase.from("system_config" as any) as any)
          .upsert(item, { onConflict: "key" });
        if (error) throw error;
      }

      toast.success("Configurações de comissão salvas com sucesso!");
      setDirty(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Carregando configurações de comissão…</span>
      </div>
    );
  }

  const directEnabled = config.directCommissionEnabled === "true";
  const indirectEnabled = config.indirectCommissionEnabled === "true";

  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-base">Configurações de Comissão da Rede</h4>
          <p className="text-xs text-muted-foreground">Configure lucro direto e indireto dos revendedores</p>
        </div>
      </div>

      {/* Resumo explicativo */}
      <InfoCard items={[
        { icon: Users, iconColor: "text-success", label: "Comissão Direta", description: "percentual do lucro da venda que vai para o vendedor que realizou a recarga." },
        { icon: GitBranch, iconColor: "text-warning", label: "Comissão Indireta", description: "percentual do lucro da venda que vai para quem indicou o vendedor (upline / avô)." },
      ]} />

      {/* Comissão Direta */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-sm text-foreground">Comissão Direta</h5>
            <p className="text-[11px] text-muted-foreground">Percentual do lucro real que o revendedor imediato recebe</p>
          </div>
          <button onClick={() => toggle("directCommissionEnabled")} className="transition-colors">
            {directEnabled
              ? <ToggleRight className="h-7 w-7 text-success" />
              : <ToggleLeft className="h-7 w-7 text-muted-foreground" />
            }
          </button>
        </div>

        {directEnabled && (
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-sm font-medium text-foreground">Porcentagem da Comissão Direta (%)</label>
            <p className="text-[11px] text-muted-foreground">
              100% = revendedor recebe o lucro integral. Ex: 80% = revendedor recebe 80% do lucro, 20% fica com o sistema.
            </p>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={config.directCommissionPercent}
              onChange={e => setPercent("directCommissionPercent", e.target.value)}
              className="w-full max-w-[160px] px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="100"
            />
          </div>
        )}
      </motion.div>

      {/* Comissão Indireta */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-sm text-foreground">Comissão Indireta</h5>
            <p className="text-[11px] text-muted-foreground">Revendedores "avô" recebem % do lucro dos sub-revendedores</p>
          </div>
          <button onClick={() => toggle("indirectCommissionEnabled")} className="transition-colors">
            {indirectEnabled
              ? <ToggleRight className="h-7 w-7 text-success" />
              : <ToggleLeft className="h-7 w-7 text-muted-foreground" />
            }
          </button>
        </div>

        {indirectEnabled && (
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-sm font-medium text-foreground">Porcentagem da Comissão Indireta (%)</label>
            <p className="text-[11px] text-muted-foreground">
              Percentual sobre o lucro direto que o revendedor "avô" recebe quando um sub-revendedor faz uma recarga.
            </p>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={config.indirectCommissionPercent}
              onChange={e => setPercent("indirectCommissionPercent", e.target.value)}
              className="w-full max-w-[160px] px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="10"
            />
          </div>
        )}
      </motion.div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando…" : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}
