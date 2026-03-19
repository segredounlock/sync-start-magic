import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupportChannel {
  label: string;
  icon: string;
  link: string;
  showInBubble?: boolean;
}

interface UseSupportChannelsResult {
  channels: SupportChannel[];
  bubbleChannel: SupportChannel | null;
  isCustom: boolean;
  loading: boolean;
}

/**
 * Busca os canais de suporte personalizados do revendedor do usuário.
 * Sobe na cadeia (reseller → reseller do reseller) até encontrar um com suporte ativo,
 * ou retorna vazio (fallback para suporte do sistema).
 */
export function useSupportChannels(userId: string | undefined): UseSupportChannelsResult {
  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        // Get user's reseller_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("reseller_id")
          .eq("id", userId!)
          .single();

        if (!profile?.reseller_id) {
          if (!cancelled) { setLoading(false); }
          return;
        }

        // Walk up the reseller chain (max 5 levels to avoid infinite loops)
        let currentResellerId: string | null = profile.reseller_id;
        for (let i = 0; i < 5 && currentResellerId; i++) {
          const { data: configs } = await (supabase.from("reseller_config") as any)
            .select("key, value")
            .eq("user_id", currentResellerId)
            .in("key", ["custom_support_enabled", "support_channels"]);

          if (configs && configs.length > 0) {
            const enabledRow = configs.find((r: any) => r.key === "custom_support_enabled");
            const channelsRow = configs.find((r: any) => r.key === "support_channels");

            if (enabledRow?.value === "true" && channelsRow?.value) {
              try {
                const parsed: SupportChannel[] = JSON.parse(channelsRow.value);
                if (parsed.length > 0) {
                  if (!cancelled) {
                    setChannels(parsed);
                    setIsCustom(true);
                    setLoading(false);
                  }
                  return;
                }
              } catch { /* invalid JSON, continue up */ }
            }
          }

          // Go up one level
          const parentResult = await supabase
            .from("profiles")
            .select("reseller_id")
            .eq("id", currentResellerId)
            .single();

          currentResellerId = parentResult.data?.reseller_id || null;
        }
      } catch {
        // silent fail → fallback to system support
      }

      if (!cancelled) { setLoading(false); }
    }

    resolve();
    return () => { cancelled = true; };
  }, [userId]);

  const bubbleChannel = channels.find(c => c.showInBubble) || channels[0] || null;

  return { channels, bubbleChannel, isCustom, loading };
}
