import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeeConfig {
  taxaTipo: string; // "fixo" | "percentual"
  taxaValor: number;
  loaded: boolean;
}

interface FeePreview {
  feeAmount: number;
  netAmount: number;
  hasFee: boolean;
  feeLabel: string; // e.g. "R$ 0,45" or "5%"
  loaded: boolean;
}

/**
 * Hook to fetch fee configuration and calculate a preview of the deposit fee.
 * Reads from system_config (taxaTipo + taxaValor).
 */
export function useFeePreview(): { config: FeeConfig; calcFee: (amount: number) => FeePreview } {
  const [config, setConfig] = useState<FeeConfig>({ taxaTipo: "", taxaValor: 0, loaded: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("system_config")
          .select("key, value")
          .in("key", ["taxaTipo", "taxaValor"]);

        if (cancelled) return;
        const map: Record<string, string> = {};
        data?.forEach((r: any) => { map[r.key] = r.value || ""; });

        setConfig({
          taxaTipo: map.taxaTipo || "",
          taxaValor: parseFloat((map.taxaValor || "0").replace(",", ".")) || 0,
          loaded: true,
        });
      } catch {
        if (!cancelled) setConfig(prev => ({ ...prev, loaded: true }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const calcFee = useMemo(() => {
    return (amount: number): FeePreview => {
      if (!config.loaded || !config.taxaTipo || config.taxaValor <= 0 || !amount || amount <= 0) {
        return { feeAmount: 0, netAmount: amount || 0, hasFee: false, feeLabel: "", loaded: config.loaded };
      }

      let fee = 0;
      if (config.taxaTipo === "percentual") {
        fee = Math.round(amount * config.taxaValor) / 100;
      } else {
        fee = config.taxaValor;
      }
      fee = Math.round(fee * 100) / 100;
      const net = Math.max(0, Math.round((amount - fee) * 100) / 100);

      const feeLabel = config.taxaTipo === "percentual"
        ? `${config.taxaValor}%`
        : `R$ ${config.taxaValor.toFixed(2).replace(".", ",")}`;

      return { feeAmount: fee, netAmount: net, hasFee: true, feeLabel, loaded: true };
    };
  }, [config]);

  return { config, calcFee };
}
