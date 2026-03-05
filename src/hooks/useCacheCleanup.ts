import { useEffect } from "react";

/**
 * Automatic cache cleanup hook.
 * Runs on mount and periodically to prevent storage accumulation.
 * Cleans: Cache API, localStorage stale entries, old SW caches.
 */
export function useCacheCleanup() {
  useEffect(() => {
    const cleanup = async () => {
      try {
        // 1. Clean old Cache API entries (Service Worker caches)
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          const validPrefixes = [
            "workbox-precache",
            "google-fonts-cache",
            "gstatic-fonts-cache",
            "images-cache",
            "api-cache",
          ];
          for (const name of cacheNames) {
            const isValid = validPrefixes.some((p) => name.includes(p));
            if (!isValid && !name.includes("workbox")) {
              await caches.delete(name);
              console.log(`[CacheCleanup] Deleted old cache: ${name}`);
            }
          }

          // 2. Purge oversized api-cache
          const apiCache = await caches.open("api-cache").catch(() => null);
          if (apiCache) {
            const keys = await apiCache.keys();
            if (keys.length > 50) {
              // Delete oldest entries (first 20)
              for (let i = 0; i < 20; i++) {
                await apiCache.delete(keys[i]);
              }
              console.log(`[CacheCleanup] Trimmed api-cache from ${keys.length} entries`);
            }
          }
        }

        // 3. Clean stale localStorage entries (older than 7 days)
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const keysToCheck = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keysToCheck.push(key);
        }
        for (const key of keysToCheck) {
          // Skip essential keys
          if (
            key.startsWith("sb-") || // Supabase auth
            key === "theme" ||
            key === "pin-verified" ||
            key === "splashShown"
          ) continue;

          // Check timestamped entries
          try {
            const val = localStorage.getItem(key);
            if (val) {
              const parsed = JSON.parse(val);
              if (parsed?._ts && now - parsed._ts > SEVEN_DAYS) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Non-JSON, skip
          }
        }

        // 4. Clean expired sessionStorage
        sessionStorage.removeItem("react-query-offline-cache");

        // 5. Record last cleanup time
        localStorage.setItem("_lastCacheCleanup", JSON.stringify({ _ts: now }));

        console.log("[CacheCleanup] Completed");
      } catch (err) {
        console.warn("[CacheCleanup] Error:", err);
      }
    };

    // Run on mount if not cleaned in last 6 hours
    const last = localStorage.getItem("_lastCacheCleanup");
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    let shouldRun = true;
    if (last) {
      try {
        const parsed = JSON.parse(last);
        if (parsed?._ts && Date.now() - parsed._ts < SIX_HOURS) {
          shouldRun = false;
        }
      } catch {}
    }

    if (shouldRun) {
      // Delay to not block initial render
      const timer = setTimeout(cleanup, 5000);
      return () => clearTimeout(timer);
    }

    // Also run periodically every 6 hours while app is open
    const interval = setInterval(cleanup, SIX_HOURS);
    return () => clearInterval(interval);
  }, []);
}
