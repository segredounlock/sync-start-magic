import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_SITE_NAME = "Sistema de Recargas";
const CACHE_KEY = "cached_site_name";
const CACHE_TTL = 5 * 60 * 1000; // 5 min
const BRANDING_EVENT = "site-branding-updated";

let memoryCache: { value: string; time: number } | null = null;

export function invalidateSiteNameCache() {
  memoryCache = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

async function fetchSiteName(): Promise<string> {
  const { data } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "siteTitle")
    .maybeSingle();
  const val = data?.value || DEFAULT_SITE_NAME;
  memoryCache = { value: val, time: Date.now() };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)); } catch {}
  return val;
}

export function useSiteName(): string {
  const [name, setName] = useState<string>(() => {
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
    return DEFAULT_SITE_NAME;
  });

  const refresh = useCallback(() => {
    fetchSiteName().then(setName);
  }, []);

  useEffect(() => {
    if (!memoryCache || Date.now() - memoryCache.time >= CACHE_TTL) {
      refresh();
    }

    window.addEventListener(BRANDING_EVENT, refresh);
    return () => window.removeEventListener(BRANDING_EVENT, refresh);
  }, [refresh]);

  return name;
}

export function getSiteNameSync(): string {
  if (memoryCache && Date.now() - memoryCache.time < CACHE_TTL) return memoryCache.value;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.value) return parsed.value;
    }
  } catch {}
  return DEFAULT_SITE_NAME;
}

export { DEFAULT_SITE_NAME };
