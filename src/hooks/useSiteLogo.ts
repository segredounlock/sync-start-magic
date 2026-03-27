import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import fallbackLogo from "@/assets/recargas-brasil-logo.jpeg";

const CACHE_KEY = "cached_site_logo";
const CACHE_TTL = 5 * 60 * 1000; // 5 min
const BRANDING_EVENT = "site-branding-updated";

let memoryCache: { value: string; time: number } | null = null;

export function invalidateSiteLogoCache() {
  memoryCache = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

function fetchSiteLogo(): Promise<string> {
  return supabase
    .from("system_config")
    .select("value")
    .eq("key", "siteLogo")
    .maybeSingle()
    .then(({ data }) => {
      const val = data?.value || fallbackLogo;
      memoryCache = { value: val, time: Date.now() };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)); } catch {}
      return val;
    });
}

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

  const refresh = useCallback(() => {
    fetchSiteLogo().then(setLogoUrl);
  }, []);

  useEffect(() => {
    if (!memoryCache || Date.now() - memoryCache.time >= CACHE_TTL) {
      refresh();
    }

    window.addEventListener(BRANDING_EVENT, refresh);
    return () => window.removeEventListener(BRANDING_EVENT, refresh);
  }, [refresh]);

  return logoUrl;
}

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
