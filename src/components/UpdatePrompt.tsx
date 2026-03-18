import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useRef } from "react";

/**
 * Silent SW updater:
 * - Checks for new versions every 30 min
 * - When a new version is found, waits for the app to be hidden/inactive for 2 min
 * - Then auto-applies the update silently (no button, no reload interruption)
 * - If the user returns before 2 min, the timer resets
 */
export default function UpdatePrompt() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        setInterval(() => registration.update(), 30 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (!needRefresh) return;

    const tryUpdate = () => {
      // Only update when page is hidden (user switched tab/minimized)
      if (document.hidden) {
        timerRef.current = setTimeout(() => {
          console.log("[UpdatePrompt] App inactive for 5min, applying update silently");
          updateServiceWorker(true);
        }, 5 * 60 * 1000); // 5 minutes of inactivity
      }
    };

    const cancelUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        tryUpdate();
      } else {
        cancelUpdate();
      }
    };

    // If already hidden when update arrives, start timer
    if (document.hidden) tryUpdate();

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelUpdate();
    };
  }, [needRefresh, updateServiceWorker]);

  // No visible UI — fully silent
  return null;
}
