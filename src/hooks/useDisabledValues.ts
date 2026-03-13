import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DisabledValue {
  operadora_id: string;
  valor: number;
}

/**
 * Hook para carregar e gerenciar valores de recarga desativados.
 * Retorna um Set de chaves "operadoraId-valor" para lookup O(1).
 */
export function useDisabledValues() {
  const [disabledSet, setDisabledSet] = useState<Set<string>>(new Set());
  const [disabledList, setDisabledList] = useState<DisabledValue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data } = await (supabase.from("disabled_recharge_values" as any) as any)
        .select("operadora_id, valor");
      const items: DisabledValue[] = (data || []).map((d: any) => ({
        operadora_id: d.operadora_id,
        valor: Number(d.valor),
      }));
      setDisabledList(items);
      setDisabledSet(new Set(items.map(d => `${d.operadora_id}-${d.valor}`)));
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const isDisabled = useCallback((operadoraId: string, valor: number) => {
    return disabledSet.has(`${operadoraId}-${valor}`);
  }, [disabledSet]);

  const toggle = useCallback(async (operadoraId: string, valor: number, userId: string) => {
    const key = `${operadoraId}-${valor}`;
    if (disabledSet.has(key)) {
      // Re-enable: delete
      await (supabase.from("disabled_recharge_values" as any) as any)
        .delete()
        .eq("operadora_id", operadoraId)
        .eq("valor", valor);
    } else {
      // Disable: insert
      await (supabase.from("disabled_recharge_values" as any) as any)
        .insert({ operadora_id: operadoraId, valor, disabled_by: userId });
    }
    await fetch();
  }, [disabledSet, fetch]);

  const filterValores = useCallback((operadoraId: string, valores: number[]) => {
    return valores.filter(v => !disabledSet.has(`${operadoraId}-${v}`));
  }, [disabledSet]);

  return { isDisabled, toggle, filterValores, disabledList, disabledSet, loading, refetch: fetch };
}
