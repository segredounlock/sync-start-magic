import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import fallbackLogo from "@/assets/recargas-brasil-logo.jpeg";

const CACHE_KEY = "cached_site_logo";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

let memoryCache: { value: string; time: number } | null = null;

/**
 * Returns the site logo URL from system_config (key: siteLogo).
 * Falls back to the local bundled logo if not set.
 * Uses memory + localStorage cache to avoid flickering.
 */
export function useSiteLogo(): string {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (memoryCache && Date.now() - memoryCache.time < CACHE_TTL) return memoryCache.value;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.value && Date.now() - parsed.time < CACHE_TTL) {
          memoryCache = parsed;
          return parsed.value;
        }
      }
    } catch {}
    return fallbackLogo;
  });

  useEffect(() => {
    if (memoryCache && Date.now() - memoryCache.time < CACHE_TTL) return;

    supabase
      .from("system_config")
      .select("value")
      .eq("key", "siteLogo")
      .maybeSingle()
      .then(({ data }) => {
        const val = data?.value || fallbackLogo;
        memoryCache = { value: val, time: Date.now() };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)); } catch {}
        setLogoUrl(val);
      });
  }, []);

  return logoUrl;
}

/**
 * Synchronous read for non-hook contexts.
 */
export function getSiteLogoSync(): string {
  if (memoryCache && Date.now() - memoryCache.time < CACHE_TTL) return memoryCache.value;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.value) return parsed.value;
    }
  } catch {}
  return fallbackLogo;
}

export { fallbackLogo };
