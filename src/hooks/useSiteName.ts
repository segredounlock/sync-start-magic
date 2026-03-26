import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_SITE_NAME = "Recargas Brasil";
const CACHE_KEY = "cached_site_name";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

let memoryCache: { value: string; time: number } | null = null;

/**
 * Returns the site name from system_config (key: siteTitle).
 * Uses memory + localStorage cache to avoid flickering.
 */
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

  useEffect(() => {
    if (memoryCache && Date.now() - memoryCache.time < CACHE_TTL) return;

    supabase
      .from("system_config")
      .select("value")
      .eq("key", "siteTitle")
      .maybeSingle()
      .then(({ data }) => {
        const val = data?.value || DEFAULT_SITE_NAME;
        memoryCache = { value: val, time: Date.now() };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)); } catch {}
        setName(val);
      });
  }, []);

  return name;
}

/**
 * For non-hook contexts (edge-case one-off reads).
 * Returns cached value or default synchronously.
 */
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
