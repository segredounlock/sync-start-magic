import { useEffect } from "react";

// Bump this on every deploy to force cache refresh
const APP_VERSION = "2.5.0";
const VERSION_KEY = "_appVersion";

/**
 * Automatic cache cleanup hook.
 * - Forces full cache wipe when APP_VERSION changes (new deploy)
 * - Periodically trims stale caches every 6 hours
 * - Ensures CSS/JS animations never get stuck on old cached files
 */
export function useCacheCleanup() {
  useEffect(() => {
    const currentVersion = localStorage.getItem(VERSION_KEY);

    // ── Version mismatch = force full cleanup ──
    if (currentVersion !== APP_VERSION) {
      console.log(`[CacheCleanup] Version change ${currentVersion} → ${APP_VERSION}, forcing full cleanup`);
      forceFullCleanup().then(() => {
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        console.log("[CacheCleanup] Full cleanup done, version saved");
      });
      return;
    }

    // ── Periodic cleanup (every 6h) ──
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
      const timer = setTimeout(periodicCleanup, 5000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(periodicCleanup, SIX_HOURS);
    return () => clearInterval(interval);
  }, []);
}

/** Nuclear cleanup — wipes ALL caches + stale storage. Used on version bump. */
async function forceFullCleanup() {
  try {
    // 1. Delete ALL Cache API entries
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      console.log(`[CacheCleanup] Deleted ${names.length} caches`);
    }

    // 2. Unregister stale service workers and re-register
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.update().catch(() => {});
      }
    }

    // 3. Clean stale localStorage (preserve essentials)
    const preserve = new Set(["theme", "pin-verified", "splashShown", VERSION_KEY]);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith("sb-") && !preserve.has(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 4. Clean sessionStorage
    sessionStorage.clear();

    // 5. Record cleanup
    localStorage.setItem("_lastCacheCleanup", JSON.stringify({ _ts: Date.now() }));
  } catch (err) {
    console.warn("[CacheCleanup] Force cleanup error:", err);
  }
}

/** Light cleanup — trims old/oversized caches without full wipe */
async function periodicCleanup() {
  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      const validPrefixes = ["workbox-precache", "google-fonts-cache", "gstatic-fonts-cache", "images-cache", "api-cache"];
      for (const name of cacheNames) {
        const isValid = validPrefixes.some((p) => name.includes(p));
        if (!isValid && !name.includes("workbox")) {
          await caches.delete(name);
        }
      }

      const apiCache = await caches.open("api-cache").catch(() => null);
      if (apiCache) {
        const keys = await apiCache.keys();
        if (keys.length > 50) {
          for (let i = 0; i < 20; i++) await apiCache.delete(keys[i]);
        }
      }
    }

    // Clean stale localStorage (>7 days)
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || key.startsWith("sb-") || ["theme", "pin-verified", "splashShown", VERSION_KEY].includes(key)) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "");
        if (parsed?._ts && now - parsed._ts > SEVEN_DAYS) {
          localStorage.removeItem(key);
        }
      } catch {}
    }

    sessionStorage.removeItem("react-query-offline-cache");
    localStorage.setItem("_lastCacheCleanup", JSON.stringify({ _ts: now }));
    console.log("[CacheCleanup] Periodic cleanup done");
  } catch (err) {
    console.warn("[CacheCleanup] Error:", err);
  }
}
