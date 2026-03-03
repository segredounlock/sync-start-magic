import { useEffect, useState, useCallback, useRef } from "react";
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
  const [displayedTheme, setDisplayedTheme] = useState<SeasonalThemeKey>("none");
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyThemeChange = useCallback((newKey: SeasonalThemeKey) => {
    setActiveTheme(prev => {
      if (prev === newKey) return prev;

      if (prev !== "none") {
        // Graceful exit: wait 1.5s before swapping emojis/labels
        setTransitioning(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setDisplayedTheme(newKey);
          setTransitioning(false);
        }, 1500);
      } else {
        setDisplayedTheme(newKey);
      }

      return newKey;
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_seasonal_theme" as any);
      if (data && data !== "none") {
        applyThemeChange(data as SeasonalThemeKey);
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
        applyThemeChange((payload.new?.value || "none") as SeasonalThemeKey);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [applyThemeChange]);

  const theme = SEASONAL_THEMES.find(t => t.key === displayedTheme) || SEASONAL_THEMES[0];
  const emojis = SEASONAL_BUTTON_EMOJIS[displayedTheme] || {};
  const isActive = displayedTheme !== "none";

  return { activeTheme, displayedTheme, theme, emojis, isActive, transitioning };
}
