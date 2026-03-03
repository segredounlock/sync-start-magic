import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SeasonalThemeKey } from "@/components/SeasonalEffects";
import { SEASONAL_THEMES } from "@/components/SeasonalEffects";

// Seasonal emoji overrides for bot/menu buttons
export const SEASONAL_BUTTON_EMOJIS: Record<SeasonalThemeKey, Record<string, string>> = {
  none: {},
  ano_novo: { saldo: "🥂", recarga: "🎆", historico: "🎇", deposito: "✨", conta: "⭐", chat: "🥳", menu: "🎉" },
  carnaval: { saldo: "🎭", recarga: "💃", historico: "🎊", deposito: "🪇", conta: "🌈", chat: "🎉", menu: "🎭" },
  pascoa: { saldo: "🥚", recarga: "🐰", historico: "🐣", deposito: "🍫", conta: "🌸", chat: "🌷", menu: "🐰" },
  dia_maes: { saldo: "💐", recarga: "🌹", historico: "🌸", deposito: "❤️", conta: "💕", chat: "🌺", menu: "💐" },
  dia_namorados: { saldo: "💘", recarga: "💕", historico: "💖", deposito: "❤️", conta: "💝", chat: "🥰", menu: "💕" },
  festa_junina: { saldo: "🌽", recarga: "🔥", historico: "🪗", deposito: "🎪", conta: "⛺", chat: "🎏", menu: "🎪" },
  dia_pais: { saldo: "👔", recarga: "⭐", historico: "🏆", deposito: "💪", conta: "🎖️", chat: "💙", menu: "👔" },
  dia_criancas: { saldo: "🎈", recarga: "🎮", historico: "🧸", deposito: "🍭", conta: "🌈", chat: "🎠", menu: "🎈" },
  black_friday: { saldo: "💰", recarga: "⚡", historico: "🏷️", deposito: "💸", conta: "🤑", chat: "🔥", menu: "🏷️" },
  natal: { saldo: "🎁", recarga: "🎄", historico: "❄️", deposito: "🎅", conta: "☃️", chat: "⭐", menu: "🎄" },
};

export function useSeasonalTheme() {
  const [activeTheme, setActiveTheme] = useState<SeasonalThemeKey>("none");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_seasonal_theme" as any);
      if (data && data !== "none") {
        setActiveTheme(data as SeasonalThemeKey);
      }
    };
    load();

    const channel = supabase
      .channel("seasonal-theme-hook")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "system_config",
        filter: "key=eq.seasonalTheme",
      }, (payload: any) => {
        setActiveTheme((payload.new?.value || "none") as SeasonalThemeKey);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const theme = SEASONAL_THEMES.find(t => t.key === activeTheme) || SEASONAL_THEMES[0];
  const emojis = SEASONAL_BUTTON_EMOJIS[activeTheme] || {};
  const isActive = activeTheme !== "none";

  return { activeTheme, theme, emojis, isActive };
}
